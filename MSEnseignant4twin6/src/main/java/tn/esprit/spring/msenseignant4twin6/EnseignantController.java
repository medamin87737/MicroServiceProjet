package tn.esprit.spring.msenseignant4twin6;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tn.esprit.spring.msenseignant4twin6.dto.EnseignantResponseDto;

import java.util.List;
import java.util.stream.Collectors;

@RefreshScope
@RestController
@RequestMapping("/enseignants")
public class EnseignantController {

    private final IEnseignantService service;

    @Value("${welcome.message}")
    private String welcomeMessage;

    public EnseignantController(IEnseignantService service) {
        this.service = service;
    }

    @GetMapping("/welcome")
    public String welcome() {
        return welcomeMessage;
    }

    @GetMapping
    public ResponseEntity<List<EnseignantResponseDto>> getAll() {
        List<EnseignantResponseDto> data = service.getAll().stream()
                .map(EnseignantResponseDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EnseignantResponseDto> getById(@PathVariable Long id) {
        return service.getById(id)
                .map(EnseignantResponseDto::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<EnseignantResponseDto> create(@RequestBody Enseignant entity) {
        Enseignant created = service.create(entity);
        return ResponseEntity.ok(EnseignantResponseDto.fromEntity(created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EnseignantResponseDto> update(@PathVariable Long id, @RequestBody Enseignant entity) {
        return service.update(id, entity)
                .map(EnseignantResponseDto::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
