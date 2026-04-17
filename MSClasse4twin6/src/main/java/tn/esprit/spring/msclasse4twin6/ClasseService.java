package tn.esprit.spring.msclasse4twin6;

import org.springframework.stereotype.Service;
import tn.esprit.spring.msclasse4twin6.dto.ClasseAvecMatieresDto;
import tn.esprit.spring.msclasse4twin6.feign.MatiereClasseInfo;
import tn.esprit.spring.msclasse4twin6.feign.MatiereFeignClient;

import java.util.List;
import java.util.Optional;

@Service
public class ClasseService implements IClasseService {

    private final ClasseRepository repository;
    private final MatiereFeignClient matiereFeignClient;

    public ClasseService(ClasseRepository repository, MatiereFeignClient matiereFeignClient) {
        this.repository = repository;
        this.matiereFeignClient = matiereFeignClient;
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

    @Override
    public Optional<ClasseAvecMatieresDto> getClasseAvecMatieres(Long classeId) {
        return repository.findById(classeId).map(classe -> {
            List<MatiereClasseInfo> matieres = matiereFeignClient.getByClasseId(classeId);
            ClasseAvecMatieresDto dto = new ClasseAvecMatieresDto();
            dto.setClasseId(classe.getId());
            dto.setClasseNom(classe.getNom());
            dto.setClasseDescription(classe.getDescription());
            dto.setMatieres(matieres);
            return dto;
        });
    }
}
