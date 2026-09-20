package com.aiinterview.service;

import com.aiinterview.dto.AuthResponse;
import com.aiinterview.dto.GoogleAuthRequest;
import com.aiinterview.dto.LoginRequest;
import com.aiinterview.dto.RegisterRequest;
import com.aiinterview.entity.User;
import com.aiinterview.exception.DuplicateEmailException;
import com.aiinterview.exception.GoogleAuthException;
import com.aiinterview.exception.InvalidCredentialsException;
import com.aiinterview.repository.UserRepository;
import com.aiinterview.security.GoogleTokenVerifierService;
import com.aiinterview.security.GoogleUserInfo;
import com.aiinterview.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private GoogleTokenVerifierService googleTokenVerifierService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, new BCryptPasswordEncoder(), jwtUtil, googleTokenVerifierService);
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

        DuplicateEmailException exception = assertThrows(DuplicateEmailException.class,
                () -> authService.register(validRegisterRequest()));

        assertEquals("This email has been used before", exception.getMessage());
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

    @Test
    void login_throwsInvalidCredentials_whenAccountHasNoLocalPassword() {
        // Simulates a user who registered via Google Sign-In and never set a password.
        User googleOnlyUser = new User();
        googleOnlyUser.setId(2L);
        googleOnlyUser.setEmail("google-user@example.com");
        googleOnlyUser.setGoogleId("google-sub-1");
        googleOnlyUser.setPasswordHash(null);

        when(userRepository.findByEmailIgnoreCase("google-user@example.com")).thenReturn(Optional.of(googleOnlyUser));

        LoginRequest request = new LoginRequest();
        request.setEmail("google-user@example.com");
        request.setPassword("whatever1");

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    private GoogleAuthRequest googleRequest(String idToken) {
        GoogleAuthRequest request = new GoogleAuthRequest();
        request.setIdToken(idToken);
        return request;
    }

    @Test
    void googleAuth_logsInExistingGoogleUser_whenGoogleIdAlreadyLinked() {
        GoogleUserInfo googleUser = new GoogleUserInfo("google-sub-123", "ada@example.com", "Ada", "Lovelace");
        when(googleTokenVerifierService.verify("valid-token")).thenReturn(googleUser);

        User existing = new User();
        existing.setId(5L);
        existing.setEmail("ada@example.com");
        existing.setGoogleId("google-sub-123");
        when(userRepository.findByGoogleId("google-sub-123")).thenReturn(Optional.of(existing));
        when(jwtUtil.generateToken(5L, "ada@example.com")).thenReturn("fake-jwt-token");

        AuthResponse response = authService.authenticateWithGoogle(googleRequest("valid-token"));

        assertEquals("fake-jwt-token", response.getToken());
        assertEquals("ada@example.com", response.getUser().getEmail());
        verify(userRepository, never()).save(any());
    }

    @Test
    void googleAuth_linksGoogleIdToExistingEmailAccount_whenEmailAlreadyRegisteredWithPassword() {
        GoogleUserInfo googleUser = new GoogleUserInfo("google-sub-456", "ada@example.com", "Ada", "Lovelace");
        when(googleTokenVerifierService.verify("valid-token")).thenReturn(googleUser);

        User existingPasswordUser = new User();
        existingPasswordUser.setId(7L);
        existingPasswordUser.setEmail("ada@example.com");
        existingPasswordUser.setPasswordHash("some-bcrypt-hash");

        when(userRepository.findByGoogleId("google-sub-456")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("ada@example.com")).thenReturn(Optional.of(existingPasswordUser));
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtUtil.generateToken(7L, "ada@example.com")).thenReturn("fake-jwt-token");

        AuthResponse response = authService.authenticateWithGoogle(googleRequest("valid-token"));

        assertEquals("fake-jwt-token", response.getToken());
        assertEquals("google-sub-456", existingPasswordUser.getGoogleId());
        verify(userRepository).save(existingPasswordUser);
    }

    @Test
    void googleAuth_createsNewUser_whenNoExistingAccountMatches() {
        GoogleUserInfo googleUser = new GoogleUserInfo("google-sub-789", "newperson@example.com", "New", "Person");
        when(googleTokenVerifierService.verify("valid-token")).thenReturn(googleUser);

        when(userRepository.findByGoogleId("google-sub-789")).thenReturn(Optional.empty());
        when(userRepository.findByEmailIgnoreCase("newperson@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0, User.class);
            user.setId(99L);
            return user;
        });
        when(jwtUtil.generateToken(99L, "newperson@example.com")).thenReturn("fake-jwt-token");

        AuthResponse response = authService.authenticateWithGoogle(googleRequest("valid-token"));

        assertEquals("fake-jwt-token", response.getToken());
        assertEquals("newperson@example.com", response.getUser().getEmail());
        assertEquals("New", response.getUser().getFirstName());

        verify(userRepository).save(argThat(user ->
                "google-sub-789".equals(user.getGoogleId()) && user.getPasswordHash() == null
        ));
    }

    @Test
    void googleRegister_throwsDuplicateEmailException_whenEmailAlreadyExists() {
        GoogleUserInfo googleUser = new GoogleUserInfo("google-sub-existing", "ada@example.com", "Ada", "Lovelace");
        when(googleTokenVerifierService.verify("valid-token")).thenReturn(googleUser);
        when(userRepository.findByEmailIgnoreCase("ada@example.com"))
                .thenReturn(Optional.of(new User()));

        DuplicateEmailException exception = assertThrows(DuplicateEmailException.class,
                () -> authService.registerWithGoogle(googleRequest("valid-token")));

        assertEquals("This email has been used before", exception.getMessage());
        verify(userRepository, never()).save(any());
        verify(userRepository, never()).findByGoogleId(anyString());
    }

    @Test
    void googleRegister_createsNewUser_whenEmailNotTaken() {
        GoogleUserInfo googleUser = new GoogleUserInfo("google-sub-new", "newperson@example.com", "New", "Person");
        when(googleTokenVerifierService.verify("valid-token")).thenReturn(googleUser);
        when(userRepository.findByEmailIgnoreCase("newperson@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenAnswer(invocation -> {
            User user = invocation.getArgument(0, User.class);
            user.setId(100L);
            return user;
        });
        when(jwtUtil.generateToken(100L, "newperson@example.com")).thenReturn("fake-jwt-token");

        AuthResponse response = authService.registerWithGoogle(googleRequest("valid-token"));

        assertEquals("fake-jwt-token", response.getToken());
        verify(userRepository).save(argThat(user ->
                "google-sub-new".equals(user.getGoogleId()) && "newperson@example.com".equals(user.getEmail())
        ));
    }

    @Test
    void googleAuth_propagatesGoogleAuthException_whenTokenInvalid() {
        when(googleTokenVerifierService.verify("bad-token"))
                .thenThrow(new GoogleAuthException("Google authentication failed. Please try again."));

        assertThrows(GoogleAuthException.class, () -> authService.authenticateWithGoogle(googleRequest("bad-token")));
        verify(userRepository, never()).save(any());
    }
}
