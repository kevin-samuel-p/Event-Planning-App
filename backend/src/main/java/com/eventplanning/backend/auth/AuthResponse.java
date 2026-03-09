package com.eventplanning.backend.auth;

import com.eventplanning.backend.user.Role;

public record AuthResponse(Long userId, String email, Role role, String token) {
}