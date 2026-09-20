package com.docify.backend.dto.auth;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String name,
        String email
) {
}