package tn.esprit.spring.msclasse4twin6;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClasseService implements IClasseService {

    private final ClasseRepository repository;

    public ClasseService(ClasseRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Classe> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Classe> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Classe create(Classe entity) {
        entity.setId(null);
        return repository.save(entity);
    }

    @Override
    public Optional<Classe> update(Long id, Classe entity) {
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
