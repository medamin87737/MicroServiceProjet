package tn.esprit.spring.msenseignant4twin6;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MSEnseignant4twin6Application {

    public static void main(String[] args) {
        SpringApplication.run(MSEnseignant4twin6Application.class, args);
    }
}
