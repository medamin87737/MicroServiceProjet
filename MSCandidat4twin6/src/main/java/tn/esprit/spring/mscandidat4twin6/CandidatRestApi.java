package tn.esprit.spring.mscandidat4twin6;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/etudiants")
public class EtudiantRestApi {

    private String title="hello , from ms etudiants";
    @RequestMapping("/hello")
    public String hello(){
        return title;
    }

    @Autowired
    IEtudiantService etudiantService;

    @GetMapping
    public ResponseEntity<List<Etudiant>> getAllEtudiants(){
        List<Etudiant> list=etudiantService.getAll();
        return ResponseEntity.ok(list);
    }
}
