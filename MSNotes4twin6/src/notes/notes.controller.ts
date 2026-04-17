import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateInscriptionDto } from './dto/create-inscription.dto';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NotesService } from './notes.service';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  /** Affecter un étudiant à une matière (inscription) */
  @Post('inscriptions')
  affecterEtudiantMatiere(@Body() dto: CreateInscriptionDto) {
    return this.notesService.affecterEtudiantMatiere(dto);
  }

  /** Affecter une note (après inscription) */
  @Post()
  affecterNote(@Body() dto: CreateNoteDto) {
    return this.notesService.affecterNote(dto);
  }

  @Put(':id')
  modifierNote(@Param('id') id: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.modifierNote(id, dto);
  }

  @Get('etudiants/:etudiantId')
  consulterNotesEtudiant(@Param('etudiantId', ParseIntPipe) etudiantId: number) {
    return this.notesService.consulterNotesEtudiant(etudiantId);
  }

  /** Historique des notes (filtrer par étudiant avec ?etudiantId=) */
  @Get('historique')
  consulterHistorique(@Query('etudiantId') etudiantId?: string) {
    if (etudiantId == null || etudiantId === '') {
      return this.notesService.consulterHistorique();
    }
    const id = Number(etudiantId);
    if (!Number.isInteger(id) || id < 1) {
      throw new BadRequestException('Query etudiantId doit être un entier positif.');
    }
    return this.notesService.consulterHistorique(id);
  }
}
