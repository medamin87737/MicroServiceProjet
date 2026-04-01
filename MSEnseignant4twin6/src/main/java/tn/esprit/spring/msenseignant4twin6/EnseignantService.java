package tn.esprit.spring.msenseignant4twin6;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EnseignantService implements IEnseignantService {

    private final EnseignantRepository repository;

    public EnseignantService(EnseignantRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Enseignant> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Enseignant> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Enseignant create(Enseignant entity) {
        entity.setId(null);
        return repository.save(entity);
    }

    @Override
    public Optional<Enseignant> update(Long id, Enseignant entity) {
        return repository.findById(id).map(existing -> {
            existing.setNom(entity.getNom());
            existing.setDescription(entity.getDescription());
            return repository.save(existing);
        });
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
