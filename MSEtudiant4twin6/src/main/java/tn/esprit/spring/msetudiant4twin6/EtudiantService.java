package tn.esprit.spring.msetudiant4twin6;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EtudiantService implements IEtudiantService {

    private final EtudiantRepository repository;

    public EtudiantService(EtudiantRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<Etudiant> getAll() {
        return repository.findAll();
    }

    @Override
    public Optional<Etudiant> getById(Long id) {
        return repository.findById(id);
    }

    @Override
    public Etudiant create(Etudiant entity) {
        entity.setId(null);
        return repository.save(entity);
    }

    @Override
    public Optional<Etudiant> update(Long id, Etudiant entity) {
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
