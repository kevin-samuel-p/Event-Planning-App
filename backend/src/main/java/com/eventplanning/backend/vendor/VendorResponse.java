package com.eventplanning.backend.vendor;

import com.eventplanning.backend.user.User;

public record VendorResponse(Long id, String name, String email, String phone) {
    public static VendorResponse from(User user) {
        return new VendorResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone()
        );
    }
}
