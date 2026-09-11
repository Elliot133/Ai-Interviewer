package com.aiinterview.service;

import com.aiinterview.dto.AuthResponse;
import com.aiinterview.dto.LoginRequest;
import com.aiinterview.dto.RegisterRequest;
import com.aiinterview.exception.DuplicateEmailException;
import com.aiinterview.exception.InvalidCredentialsException;
import com.aiinterview.repository.UserRepository;
import com.aiinterview.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, new BCryptPasswordEncoder(), jwtUtil);
    }

    private RegisterRequest validRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Ada");
        request.setLastName("Lovelace");
        request.setEmail("ada@example.com");
        request.setPassword("StrongPass1");
        request.setConfirmPassword("StrongPass1");
        return request;
    }

    @Test
    void register_createsUser_whenEmailNotTaken() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(false);
        when(userRepository.save(any())).thenAnswer(invocation -> {
            var user = invocation.getArgument(0, com.aiinterview.entity.User.class);
            user.setId(1L);
            return user;
        });
        when(jwtUtil.generateToken(anyLong(), anyString())).thenReturn("fake-jwt-token");

        AuthResponse response = authService.register(validRegisterRequest());

        assertNotNull(response.getToken());
        assertEquals("ada@example.com", response.getUser().getEmail());
        verify(userRepository).save(any());
    }

    @Test
    void register_throwsDuplicateEmailException_whenEmailAlreadyExists() {
        when(userRepository.existsByEmailIgnoreCase(anyString())).thenReturn(true);

        assertThrows(DuplicateEmailException.class, () -> authService.register(validRegisterRequest()));
        verify(userRepository, never()).save(any());
    }

    @Test
    void register_throwsException_whenPasswordsDoNotMatch() {
        RegisterRequest request = validRegisterRequest();
        request.setConfirmPassword("Different1");

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
    }

    @Test
    void login_throwsInvalidCredentials_whenUserNotFound() {
        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(java.util.Optional.empty());

        LoginRequest request = new LoginRequest();
        request.setEmail("nobody@example.com");
        request.setPassword("whatever1");

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void login_throwsInvalidCredentials_whenPasswordIncorrect() {
        com.aiinterview.entity.User user = new com.aiinterview.entity.User();
        user.setId(1L);
        user.setEmail("ada@example.com");
        user.setPasswordHash(new BCryptPasswordEncoder().encode("CorrectPass1"));

        when(userRepository.findByEmailIgnoreCase(anyString())).thenReturn(java.util.Optional.of(user));

        LoginRequest request = new LoginRequest();
        request.setEmail("ada@example.com");
        request.setPassword("WrongPass1");

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }
}
