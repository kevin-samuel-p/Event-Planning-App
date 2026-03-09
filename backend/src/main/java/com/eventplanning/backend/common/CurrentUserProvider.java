package com.eventplanning.backend.common;

import com.eventplanning.backend.user.User;
import com.eventplanning.backend.user.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public CurrentUserProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new BadRequestException("Invalid authentication context");
        }
        return userRepository.findByEmail(jwt.getSubject())
                .orElseThrow(() -> new NotFoundException("Authenticated user not found"));
    }
}