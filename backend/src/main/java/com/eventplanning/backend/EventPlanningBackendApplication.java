package com.eventplanning.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.eventplanning.backend")
public class EventPlanningBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(EventPlanningBackendApplication.class, args);
    }
}