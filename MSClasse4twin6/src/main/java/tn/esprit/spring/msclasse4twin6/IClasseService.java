package tn.esprit.spring.msclasse4twin6;

import tn.esprit.spring.msclasse4twin6.dto.ClasseAvecMatieresDto;

import java.util.List;
import java.util.Optional;

public interface IClasseService {
    List<Classe> getAll();
    Optional<Classe> getById(Long id);
    Classe create(Classe entity);
    Optional<Classe> update(Long id, Classe entity);
    void delete(Long id);

    /** Classe + matières dédiées (OpenFeign vers MSMatiere4twin6). */
    Optional<ClasseAvecMatieresDto> getClasseAvecMatieres(Long classeId);
}
