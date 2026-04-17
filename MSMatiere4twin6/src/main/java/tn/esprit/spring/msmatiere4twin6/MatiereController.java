package tn.esprit.spring.msmatiere4twin6;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import tn.esprit.spring.msmatiere4twin6.dto.AssignationSalleRequest;
import tn.esprit.spring.msmatiere4twin6.dto.MatiereAvecEnseignantDto;

import java.util.List;

@RefreshScope
@RestController
@RequestMapping("/matieres")
public class MatiereController {

    private final IMatiereService service;

    @Value("${welcome.message}")
    private String welcomeMessage;

    public MatiereController(IMatiereService service) {
        this.service = service;
    }

    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }

    @GetMapping
    public ResponseEntity<List<Matiere>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Matiere> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Scénario OpenFeign : côté salle, ce endpoint est consommé pour lister les matières dédiées à une salle.
     */
    @GetMapping("/salle/{salleId}")
    public ResponseEntity<List<Matiere>> getBySalleId(@PathVariable Long salleId) {
        return ResponseEntity.ok(service.getBySalleId(salleId));
    }

    /**
     * Scénario OpenFeign : côté classe, ce endpoint est consommé pour lister les matières dédiées à une classe.
     */
    @GetMapping("/classe/{classeId}")
    public ResponseEntity<List<Matiere>> getByClasseId(@PathVariable Long classeId) {
        return ResponseEntity.ok(service.getByClasseId(classeId));
    }

    /**
     * Scénario OpenFeign : matière + détail enseignant récupéré sur MSEnseignant4twin6.
     */
    @GetMapping("/{id}/details-avec-enseignant/{enseignantId}")
    public ResponseEntity<MatiereAvecEnseignantDto> getDetailsAvecEnseignant(
            @PathVariable Long id,
            @PathVariable Long enseignantId) {
        return service.getDetailAvecEnseignant(id, enseignantId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Matiere> create(@RequestBody Matiere entity) {
        return ResponseEntity.ok(service.create(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Matiere> update(@PathVariable Long id, @RequestBody Matiere entity) {
        return service.update(id, entity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/assignation-salle")
    public ResponseEntity<Matiere> assignerSalle(
            @PathVariable Long id,
            @RequestBody AssignationSalleRequest request
    ) {
        return service.assignerSalle(
                        id,
                        request.getSalleId(),
                        request.getClasseId(),
                        request.getHeureDebutSeance(),
                        request.getHeureFinSeance()
                )
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
