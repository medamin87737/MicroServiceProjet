package tn.esprit.spring.mssalle4twin6;

import java.util.List;
import java.util.Optional;

public interface ISalleService {
    List<Salle> getAll();
    Optional<Salle> getById(Long id);
    Salle create(Salle entity);
    Optional<Salle> update(Long id, Salle entity);
    void delete(Long id);
}
