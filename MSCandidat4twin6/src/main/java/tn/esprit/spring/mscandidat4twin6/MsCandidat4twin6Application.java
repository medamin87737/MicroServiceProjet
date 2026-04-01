package tn.esprit.spring.mscandidat4twin6;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import org.springframework.context.annotation.Bean;

@SpringBootApplication
@EnableDiscoveryClient
public class MsCandidat4twin6Application {

    public static void main(String[] args) {
        SpringApplication.run(MsCandidat4twin6Application.class, args);
    }
    @Autowired
    private EtudiantRepository repository;
    @Bean
    ApplicationRunner init() {
        return (args) -> {
// save
            repository.save(new Etudiant("Mariem", "Ch", "ma@esprit.tn"));
            repository.save(new Etudiant("Sarra", "ab", "sa@esprit.tn"));
            repository.save(new Etudiant("Mohamed", "ba", "mo@esprit.tn"));
            repository.save(new Etudiant("Maroua", "dh", "maroua@esprit.tn"));
// fetch
            repository.findAll().forEach(System.out::println);
        };
}}

