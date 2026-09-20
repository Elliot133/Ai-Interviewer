package com.aiinterview.controller;

import com.aiinterview.dto.AuthResponse;
import com.aiinterview.dto.GoogleAuthRequest;
import com.aiinterview.dto.LoginRequest;
import com.aiinterview.dto.RegisterRequest;
import com.aiinterview.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Registration successful. Please login!");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.ok(authService.authenticateWithGoogle(request));
    }

    @PostMapping("/google/register")
    public ResponseEntity<AuthResponse> googleRegister(@Valid @RequestBody GoogleAuthRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.registerWithGoogle(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // Stateless JWT: logout is handled client-side by discarding the token.
        return ResponseEntity.noContent().build();
    }
}
