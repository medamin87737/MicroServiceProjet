package tn.esprit.spring.msetudiant4twin6;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MSEtudiant4twin6Application {

    public static void main(String[] args) {
        SpringApplication.run(MSEtudiant4twin6Application.class, args);
    }
}
