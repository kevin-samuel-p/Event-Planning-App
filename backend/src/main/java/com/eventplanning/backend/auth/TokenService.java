package com.eventplanning.backend.auth;

import com.eventplanning.backend.user.User;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final CustomJwtService customJwtService;

    public TokenService(CustomJwtService customJwtService) {
        this.customJwtService = customJwtService;
    }

    public String generate(User user) {
        return customJwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
    }
}