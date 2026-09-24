package com.fleetiq;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FleetIqApplication {
    public static void main(String[] args) {
        SpringApplication.run(FleetIqApplication.class, args);
    }
}
