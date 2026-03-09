package com.eventplanning.backend.auth;

import com.eventplanning.backend.config.JwtProperties;
import com.eventplanning.backend.user.User;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

@Service
public class TokenService {

    private final JwtEncoder jwtEncoder;
    private final JwtProperties jwtProperties;

    public TokenService(JwtEncoder jwtEncoder, JwtProperties jwtProperties) {
        this.jwtEncoder = jwtEncoder;
        this.jwtProperties = jwtProperties;
    }

    public String generate(User user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("event-planning-backend")
                .issuedAt(now)
                .expiresAt(now.plus(jwtProperties.expirationMinutes(), ChronoUnit.MINUTES))
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("userId", user.getId())
                .build();

        return jwtEncoder.encode(JwtEncoderParameters.from(claims)).getTokenValue();
    }
}