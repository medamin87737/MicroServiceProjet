package tn.esprit.spring.msmatiere4twin6;

import java.util.List;
import java.util.Optional;

public interface IMatiereService {
    List<Matiere> getAll();
    Optional<Matiere> getById(Long id);
    Matiere create(Matiere entity);
    Optional<Matiere> update(Long id, Matiere entity);
    void delete(Long id);
}
