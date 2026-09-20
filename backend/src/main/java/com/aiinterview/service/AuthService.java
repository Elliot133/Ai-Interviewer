package com.aiinterview.service;

import com.aiinterview.dto.AuthResponse;
import com.aiinterview.dto.GoogleAuthRequest;
import com.aiinterview.dto.LoginRequest;
import com.aiinterview.dto.RegisterRequest;
import com.aiinterview.dto.UserResponse;
import com.aiinterview.entity.User;
import com.aiinterview.exception.DuplicateEmailException;
import com.aiinterview.exception.InvalidCredentialsException;
import com.aiinterview.repository.UserRepository;
import com.aiinterview.security.GoogleTokenVerifierService;
import com.aiinterview.security.GoogleUserInfo;
import com.aiinterview.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Password and confirmation do not match");
        }
        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new DuplicateEmailException("This email has been used before");
        }

        User user = new User();
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setCareerField(request.getCareerField());

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail());
        return new AuthResponse(token, new UserResponse(saved));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        // Accounts created via Google Sign-In have no local password set.
        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new UserResponse(user));
    }

    /**
     * Registers or logs in a user based on a verified Google ID token.
     * <p>
     * - If a user already has this Google account linked, they are logged in.
     * - If a user already registered with this email via email/password, the
     *   Google account is linked to that existing account (so the email stays
     *   unique and no duplicate account is created).
     * - Otherwise a brand-new account is created with no local password.
     */
    @Transactional
    public AuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        GoogleUserInfo googleUser = googleTokenVerifierService.verify(request.getIdToken());

        User user = userRepository.findByGoogleId(googleUser.googleId())
                .orElseGet(() -> linkOrCreateGoogleUser(googleUser));

        String token = jwtUtil.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(token, new UserResponse(user));
    }

    @Transactional
    public AuthResponse registerWithGoogle(GoogleAuthRequest request) {
        GoogleUserInfo googleUser = googleTokenVerifierService.verify(request.getIdToken());

        if (userRepository.findByEmailIgnoreCase(googleUser.email()).isPresent()) {
            throw new DuplicateEmailException("This email has been used before");
        }

        User newUser = new User();
        newUser.setFirstName(googleUser.firstName());
        newUser.setLastName(googleUser.lastName());
        newUser.setEmail(googleUser.email().trim().toLowerCase());
        newUser.setGoogleId(googleUser.googleId());
        newUser.setPasswordHash(null);

        User saved = userRepository.save(newUser);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail());
        return new AuthResponse(token, new UserResponse(saved));
    }

    private User linkOrCreateGoogleUser(GoogleUserInfo googleUser) {
        return userRepository.findByEmailIgnoreCase(googleUser.email())
                .map(existing -> {
                    existing.setGoogleId(googleUser.googleId());
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setFirstName(googleUser.firstName());
                    newUser.setLastName(googleUser.lastName());
                    newUser.setEmail(googleUser.email().trim().toLowerCase());
                    newUser.setGoogleId(googleUser.googleId());
                    // No local password: this account can only sign in with Google
                    // until/unless the user sets one (out of scope here).
                    newUser.setPasswordHash(null);
                    return userRepository.save(newUser);
                });
    }
}
