package tn.esprit.spring.msenseignant4twin6;

import java.util.List;
import java.util.Optional;

public interface IEnseignantService {
    List<Enseignant> getAll();
    Optional<Enseignant> getById(Long id);
    Enseignant create(Enseignant entity);
    Optional<Enseignant> update(Long id, Enseignant entity);
    void delete(Long id);
}
