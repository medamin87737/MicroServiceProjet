package tn.esprit.spring.msmatiere4twin6;

import feign.FeignException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import tn.esprit.spring.msmatiere4twin6.dto.MatiereAvecEnseignantDto;
import tn.esprit.spring.msmatiere4twin6.feign.ClasseFeignClient;
import tn.esprit.spring.msmatiere4twin6.feign.EnseignantFeignClient;
import tn.esprit.spring.msmatiere4twin6.feign.EnseignantInfo;
import tn.esprit.spring.msmatiere4twin6.feign.SalleFeignClient;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Service
public class MatiereService implements IMatiereService {

    private final MatiereRepository repository;
    private final EnseignantFeignClient enseignantFeignClient;
    private final SalleFeignClient salleFeignClient;
    private final ClasseFeignClient classeFeignClient;

    public MatiereService(
            MatiereRepository repository,
            EnseignantFeignClient enseignantFeignClient,
            SalleFeignClient salleFeignClient,
            ClasseFeignClient classeFeignClient
    ) {
        this.repository = repository;
        this.enseignantFeignClient = enseignantFeignClient;
        this.salleFeignClient = salleFeignClient;
        this.classeFeignClient = classeFeignClient;
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
        validateAssignation(entity.getSalleId(), entity.getClasseId(), entity.getHeureDebutSeance(), entity.getHeureFinSeance(), false);
        return repository.save(entity);
    }

    @Override
    public Optional<Matiere> update(Long id, Matiere entity) {
        return repository.findById(id).map(existing -> {
            validateAssignation(entity.getSalleId(), entity.getClasseId(), entity.getHeureDebutSeance(), entity.getHeureFinSeance(), false);
            existing.setNom(entity.getNom());
            existing.setDescription(entity.getDescription());
            existing.setSalleId(entity.getSalleId());
            existing.setClasseId(entity.getClasseId());
            existing.setHeureDebutSeance(entity.getHeureDebutSeance());
            existing.setHeureFinSeance(entity.getHeureFinSeance());
            return repository.save(existing);
        });
    }

    @Override
    public void delete(Long id) {
        repository.deleteById(id);
    }

    @Override
    public Optional<MatiereAvecEnseignantDto> getDetailAvecEnseignant(Long matiereId, Long enseignantId) {
        Optional<Matiere> matOpt = repository.findById(matiereId);
        if (matOpt.isEmpty()) {
            return Optional.empty();
        }
        Matiere mat = matOpt.get();
        try {
            EnseignantInfo ens = enseignantFeignClient.getById(enseignantId);
            MatiereAvecEnseignantDto dto = new MatiereAvecEnseignantDto();
            dto.setMatiereId(mat.getId());
            dto.setMatiereNom(mat.getNom());
            dto.setMatiereDescription(mat.getDescription());
            dto.setEnseignantId(ens.getId());
            dto.setEnseignantNom(ens.getNom());
            dto.setEnseignantDescription(ens.getDescription());
            dto.setEnseignantMatricule(ens.getMatricule());
            dto.setEnseignantRole(ens.getRole());
            return Optional.of(dto);
        } catch (FeignException e) {
            if (e.status() == 404) {
                return Optional.empty();
            }
            throw e;
        }
    }

    @Override
    public List<Matiere> getBySalleId(Long salleId) {
        return repository.findBySalleId(salleId);
    }

    @Override
    public List<Matiere> getByClasseId(Long classeId) {
        return repository.findByClasseId(classeId);
    }

    @Override
    public Optional<Matiere> assignerSalle(Long matiereId, Long salleId, Long classeId, LocalTime heureDebutSeance, LocalTime heureFinSeance) {
        validateAssignation(salleId, classeId, heureDebutSeance, heureFinSeance, true);
        return repository.findById(matiereId).map(matiere -> {
            matiere.setSalleId(salleId);
            matiere.setClasseId(classeId);
            matiere.setHeureDebutSeance(heureDebutSeance);
            matiere.setHeureFinSeance(heureFinSeance);
            return repository.save(matiere);
        });
    }

    private void validateAssignation(
            Long salleId,
            Long classeId,
            LocalTime heureDebutSeance,
            LocalTime heureFinSeance,
            boolean strict
    ) {
        boolean nothingProvided =
                salleId == null && classeId == null && heureDebutSeance == null && heureFinSeance == null;
        if (!strict && nothingProvided) {
            return;
        }

        if (salleId == null || classeId == null || heureDebutSeance == null || heureFinSeance == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "L'assignation complète exige salleId, classeId, heureDebutSeance et heureFinSeance."
            );
        }
        if (!heureDebutSeance.isBefore(heureFinSeance)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'heure de début doit être strictement avant l'heure de fin.");
        }

        try {
            salleFeignClient.getById(salleId);
        } catch (FeignException e) {
            if (e.status() == 404) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La salle " + salleId + " est introuvable pour l'assignation."
                );
            }
            throw e;
        }

        try {
            classeFeignClient.getById(classeId);
        } catch (FeignException e) {
            if (e.status() == 404) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "La classe " + classeId + " est introuvable pour l'assignation."
                );
            }
            throw e;
        }
    }
}
