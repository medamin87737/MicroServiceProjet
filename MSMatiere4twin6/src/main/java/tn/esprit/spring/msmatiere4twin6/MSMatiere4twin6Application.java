package tn.esprit.spring.msmatiere4twin6;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class MSMatiere4twin6Application {

    public static void main(String[] args) {
        SpringApplication.run(MSMatiere4twin6Application.class, args);
    }
}
