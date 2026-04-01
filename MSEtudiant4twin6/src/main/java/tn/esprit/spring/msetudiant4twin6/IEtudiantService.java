package tn.esprit.spring.msetudiant4twin6;

import java.util.List;
import java.util.Optional;

public interface IEtudiantService {
    List<Etudiant> getAll();
    Optional<Etudiant> getById(Long id);
    Etudiant create(Etudiant entity);
    Optional<Etudiant> update(Long id, Etudiant entity);
    void delete(Long id);
}
