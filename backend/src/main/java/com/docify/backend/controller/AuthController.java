package com.docify.backend.controller;

import com.docify.backend.dto.auth.AuthResponse;
import com.docify.backend.dto.auth.LoginRequest;
import com.docify.backend.dto.auth.RegisterRequest;
import com.docify.backend.dto.profile.ChangePasswordRequest;
import com.docify.backend.dto.profile.UpdateProfileRequest;
import com.docify.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        AuthResponse response = authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        AuthResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser(
            Authentication authentication
    ) {
        AuthResponse response =
                authService.getCurrentUser(authentication.getName());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        AuthResponse response =
                authService.updateProfile(
                        authentication.getName(),
                        request
                );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication
    ) {
        authService.changePassword(
                authentication.getName(),
                request
        );

        return ResponseEntity.noContent().build();
    }
}