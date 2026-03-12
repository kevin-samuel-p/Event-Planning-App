package com.eventplanning.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class DotenvConfig {

    @PostConstruct
    public void configure() {
        // Load .env file from project root
        Dotenv dotenv = Dotenv.configure()
                .directory("..")  // Go up one level from backend/ to project root
                .filename(".env")
                .ignoreIfMissing()
                .load();
        
        // Set system properties for Spring Boot to use
        dotenv.entries().forEach(entry -> {
            System.setProperty(entry.getKey(), entry.getValue());
        });
    }
}
