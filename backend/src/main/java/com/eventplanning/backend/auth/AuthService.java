package com.eventplanning.backend.auth;

import com.eventplanning.backend.common.BadRequestException;
import com.eventplanning.backend.common.NotFoundException;
import com.eventplanning.backend.user.User;
import com.eventplanning.backend.user.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager, TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new BadRequestException("Email already in use");
        }

        User user = userRepository.save(User.builder()
                .name(request.name())
                .email(request.email())
                .phone(request.phone())
                .password(passwordEncoder.encode(request.password()))
                .role(request.role())
                .build());

        return new AuthResponse(user.getId(), user.getEmail(), user.getRole(), tokenService.generate(user));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("User not found"));

        return new AuthResponse(user.getId(), user.getEmail(), user.getRole(), tokenService.generate(user));
    }
}