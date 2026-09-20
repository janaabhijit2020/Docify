package com.docify.backend.service;

import com.docify.backend.dto.auth.AuthResponse;
import com.docify.backend.dto.auth.LoginRequest;
import com.docify.backend.dto.auth.RegisterRequest;
import com.docify.backend.dto.profile.ChangePasswordRequest;
import com.docify.backend.dto.profile.UpdateProfileRequest;
import com.docify.backend.entity.User;
import com.docify.backend.repository.UserRepository;
import com.docify.backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "An account with this email already exists."
            );
        }

        User user = new User(
                request.name().trim(),
                email,
                passwordEncoder.encode(request.password())
        );

        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);

        return new AuthResponse(
                token,
                "Bearer",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {

        String email = normalizeEmail(request.email());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password."
                        )
                );

        if (!passwordEncoder.matches(
                request.password(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        String token = jwtService.generateToken(user);

        return new AuthResponse(
                token,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(String email) {

        User user = userRepository.findByEmail(
                normalizeEmail(email)
        ).orElseThrow(() ->
                new IllegalArgumentException(
                        "Authenticated user no longer exists."
                )
        );

        return new AuthResponse(
                null,
                "Bearer",
                user.getId(),
                user.getName(),
                user.getEmail()
        );
    }

    @Transactional
    public AuthResponse updateProfile(
            String authenticatedEmail,
            UpdateProfileRequest request
    ) {

        User user = findAuthenticatedUser(authenticatedEmail);

        String name = request.name().trim();

        if (name.isEmpty()) {
            throw new IllegalArgumentException(
                    "Name cannot be empty."
            );
        }

        user.setName(name);

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                null,
                "Bearer",
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail()
        );
    }

    @Transactional
    public void changePassword(
            String authenticatedEmail,
            ChangePasswordRequest request
    ) {

        User user = findAuthenticatedUser(authenticatedEmail);

        if (!passwordEncoder.matches(
                request.currentPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }

        if (!request.newPassword().equals(
                request.confirmPassword()
        )) {
            throw new IllegalArgumentException(
                    "New password and confirmation password do not match."
            );
        }

        if (passwordEncoder.matches(
                request.newPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "New password must be different from your current password."
            );
        }

        user.setPassword(
                passwordEncoder.encode(request.newPassword())
        );

        userRepository.save(user);
    }

    private User findAuthenticatedUser(String email) {

        return userRepository.findByEmail(
                normalizeEmail(email)
        ).orElseThrow(() ->
                new IllegalArgumentException(
                        "Authenticated user no longer exists."
                )
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }
}