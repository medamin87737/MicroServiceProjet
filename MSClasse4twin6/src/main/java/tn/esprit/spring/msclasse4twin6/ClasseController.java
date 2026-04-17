package tn.esprit.spring.msclasse4twin6;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.spring.msclasse4twin6.dto.ClasseAvecMatieresDto;

import java.util.List;

@RefreshScope
@RestController
@RequestMapping("/classes")
public class ClasseController {

    private final IClasseService service;

    @Value("${welcome.message}")
    private String welcomeMessage;

    public ClasseController(IClasseService service) {
        this.service = service;
    }

    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }

    @GetMapping
    public ResponseEntity<List<Classe>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classe> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Scénario OpenFeign : classe + matières dédiées (avec horaires) récupérées sur MSMatiere4twin6.
     */
    @GetMapping("/{id}/matieres-dediees")
    public ResponseEntity<ClasseAvecMatieresDto> getClasseAvecMatieres(@PathVariable Long id) {
        return service.getClasseAvecMatieres(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Classe> create(@RequestBody Classe entity) {
        return ResponseEntity.ok(service.create(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Classe> update(@PathVariable Long id, @RequestBody Classe entity) {
        return service.update(id, entity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
