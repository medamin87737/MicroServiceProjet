package tn.esprit.spring.mscandidat4twin6;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class EtudiantService implements IEtudiantService{
    @Autowired
    EtudiantRepository etudiantRepository;


    @Override
    public List<Etudiant> getAll() {
        return etudiantRepository.findAll();
    }
}
