package tn.esprit.spring.mssalle4twin6;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SalleService implements ISalleService {

    private final SalleRepository repository;

    public SalleService(SalleRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Salle> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Salle> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Salle create(Salle entity) {
        entity.setId(null);
        return repository.save(entity);
    }

    @Override
    public Optional<Salle> update(Long id, Salle entity) {
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
