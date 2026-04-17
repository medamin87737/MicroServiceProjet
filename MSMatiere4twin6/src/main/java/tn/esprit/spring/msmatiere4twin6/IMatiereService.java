package tn.esprit.spring.msmatiere4twin6;

import tn.esprit.spring.msmatiere4twin6.dto.MatiereAvecEnseignantDto;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface IMatiereService {
    List<Matiere> getAll();
    Optional<Matiere> getById(Long id);
    Matiere create(Matiere entity);
    Optional<Matiere> update(Long id, Matiere entity);
    void delete(Long id);

    /** Matière + détail enseignant (OpenFeign vers MSEnseignant4twin6). */
    Optional<MatiereAvecEnseignantDto> getDetailAvecEnseignant(Long matiereId, Long enseignantId);

    /** Liste des matières assignées à une salle. */
    List<Matiere> getBySalleId(Long salleId);

    /** Liste des matières dédiées à une classe. */
    List<Matiere> getByClasseId(Long classeId);

    /** Affecter une salle et un créneau horaire à une matière. */
    Optional<Matiere> assignerSalle(Long matiereId, Long salleId, Long classeId, LocalTime heureDebutSeance, LocalTime heureFinSeance);
}
