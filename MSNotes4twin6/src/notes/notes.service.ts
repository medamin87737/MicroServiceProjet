import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { Inscription, InscriptionDocument } from './schemas/inscription.schema';
import { Note, NoteDocument } from './schemas/note.schema';
import { NoteHistorique } from './schemas/note-historique.schema';
import { RabbitMqPublisherService } from '../rabbitmq/rabbitmq-publisher.service';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    @InjectModel(Inscription.name)
    private readonly inscriptionModel: Model<Inscription>,
    @InjectModel(Note.name)
    private readonly noteModel: Model<Note>,
    @InjectModel(NoteHistorique.name)
    private readonly historiqueModel: Model<NoteHistorique>,
    private readonly rabbit: RabbitMqPublisherService,
  ) {}

  async affecterEtudiantMatiere(dto: CreateInscriptionDto) {
    try {
      const doc = await this.inscriptionModel.create(dto);
      const pub = this.rabbit.publish('inscription.created', {
        etudiantId: doc.etudiantId,
        matiereId: doc.matiereId,
        inscriptionId: String(doc._id),
      });
      if (pub) {
        this.logger.log(
          '[RabbitMQ — Scénario 2] Message "inscription.created" envoyé au broker → MSClasse pourra enregistrer le suivi pédagogique.',
        );
      }
      return doc.toJSON();
    } catch (e: unknown) {
      const code = (e as { code?: number }).code;
      if (code === 11000) {
        const existing = await this.inscriptionModel
          .findOne({ etudiantId: dto.etudiantId, matiereId: dto.matiereId })
          .exec();
        throw new ConflictException({
          message:
            'Cet étudiant est déjà inscrit à cette matière (Scénario 2 déjà enregistré pour cette paire). Pour retester, utilisez un autre couple etudiantId/matiereId ou supprimez l’inscription en base.',
          inscriptionId: existing?._id?.toString(),
        });
      }
      throw e;
    }
  }

  async affecterNote(dto: CreateNoteDto) {
    const ins = await this.inscriptionModel
      .findOne({
        etudiantId: dto.etudiantId,
        matiereId: dto.matiereId,
      })
      .exec();
    if (!ins) {
      throw new NotFoundException(
        'Inscription étudiant/matière introuvable. Affectez d’abord l’étudiant à la matière.',
      );
    }
    const existing = await this.noteModel.findOne({ inscriptionId: ins._id }).exec();
    if (existing) {
      throw new ConflictException({
        message:
          'Une note existe déjà pour cette inscription. Le premier POST ne peut être fait qu’une fois ; pour changer la note (Scénario 1 — grade.updated), utilisez PUT avec noteId ci-dessous.',
        noteId: existing._id.toString(),
      });
    }
    const note = await this.noteModel.create({
      inscriptionId: ins._id as Types.ObjectId,
      valeur: dto.valeur,
    });
    await this.historiqueModel.create({
      noteId: note._id as Types.ObjectId,
      etudiantId: dto.etudiantId,
      matiereId: dto.matiereId,
      nouvelleValeur: dto.valeur,
      action: 'CREATION',
    });
    const pubCreated = this.rabbit.publish('grade.created', {
      action: 'CREATION',
      noteId: note._id.toString(),
      etudiantId: dto.etudiantId,
      matiereId: dto.matiereId,
      valeur: dto.valeur,
    });
    if (pubCreated) {
      this.logger.log(
        '[RabbitMQ — Scénario 1] Message "grade.created" envoyé au broker → MSEtudiant enregistrera l’audit (table audit_notes_events).',
      );
    }
    return this.mapNoteOut(note, ins);
  }

  async modifierNote(id: string, dto: UpdateNoteDto) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(
        'L’id dans l’URL doit être l’ObjectId MongoDB de la note (24 caractères hex), pas un entier. Récupérez-le dans la réponse du POST /notes ou dans GET /notes/etudiants/:etudiantId → champ note.id.',
      );
    }
    const note = await this.noteModel.findById(id).exec();
    if (!note) {
      throw new NotFoundException(
        'Aucune note avec cet id. Vérifiez que vous utilisez bien note.id (et non inscriptionId ni etudiantId).',
      );
    }
    const ins = await this.inscriptionModel.findById(note.inscriptionId).exec();
    if (!ins) {
      throw new NotFoundException('Inscription associée introuvable.');
    }
    const ancienne = note.valeur;
    note.valeur = dto.valeur;
    await note.save();
    await this.historiqueModel.create({
      noteId: note._id as Types.ObjectId,
      etudiantId: ins.etudiantId,
      matiereId: ins.matiereId,
      ancienneValeur: ancienne,
      nouvelleValeur: dto.valeur,
      action: 'MODIFICATION',
    });
    const pubUpdated = this.rabbit.publish('grade.updated', {
      action: 'MODIFICATION',
      noteId: note._id.toString(),
      etudiantId: ins.etudiantId,
      matiereId: ins.matiereId,
      ancienneValeur: ancienne,
      nouvelleValeur: dto.valeur,
    });
    if (pubUpdated) {
      this.logger.log(
        '[RabbitMQ — Scénario 1] Message "grade.updated" envoyé au broker → MSEtudiant enregistrera la ligne d’audit de modification.',
      );
    }
    return this.mapNoteOut(note, ins);
  }

  async consulterNotesEtudiant(etudiantId: number) {
    const inscriptions = await this.inscriptionModel.find({ etudiantId }).exec();
    const results: Array<{
      inscriptionId: string;
      etudiantId: number;
      matiereId: number;
      note: {
        id: string;
        valeur: number;
        createdAt?: Date;
        updatedAt?: Date;
      } | null;
    }> = [];
    for (const ins of inscriptions) {
      const note = await this.noteModel.findOne({ inscriptionId: ins._id }).exec();
      results.push({
        inscriptionId: ins._id.toString(),
        etudiantId: ins.etudiantId,
        matiereId: ins.matiereId,
        note: note
          ? {
              id: note._id.toString(),
              valeur: note.valeur,
              createdAt: note.get('createdAt'),
              updatedAt: note.get('updatedAt'),
            }
          : null,
      });
    }
    return results;
  }

  async consulterHistorique(etudiantId?: number) {
    const filter = etudiantId != null ? { etudiantId } : {};
    return this.historiqueModel.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  private mapNoteOut(note: NoteDocument, ins: InscriptionDocument) {
    return {
      id: note._id.toString(),
      inscriptionId: ins._id.toString(),
      etudiantId: ins.etudiantId,
      matiereId: ins.matiereId,
      valeur: note.valeur,
      createdAt: note.get('createdAt') as Date | undefined,
      updatedAt: note.get('updatedAt') as Date | undefined,
    };
  }
}
