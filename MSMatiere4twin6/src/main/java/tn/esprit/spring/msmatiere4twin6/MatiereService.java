package tn.esprit.spring.msmatiere4twin6;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MatiereService implements IMatiereService {

    private final MatiereRepository repository;

    public MatiereService(MatiereRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Matiere> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Matiere> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Matiere create(Matiere entity) {
        entity.setId(null);
        return repository.save(entity);
    }

    @Override
    public Optional<Matiere> update(Long id, Matiere entity) {
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
