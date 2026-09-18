package com.aiinterview.security;

import com.aiinterview.exception.GoogleAuthException;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

/**
 * Verifies Google ID tokens sent by the frontend after a successful
 * "Continue with Google" flow.
 *
 * Nothing the frontend claims about the user (email, name, Google id) is
 * ever trusted directly: the token signature, issuer and audience are all
 * checked here, server-side, before any claim is used.
 */
@Component
public class GoogleTokenVerifierService {

    private final String googleClientId;
    private volatile GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService(@Value("${app.google.client-id}") String googleClientId) {
        // Intentionally does not validate/build anything here: this bean must
        // construct successfully even when GOOGLE_CLIENT_ID is not set yet,
        // so a missing Google config can never prevent the app (and existing
        // email/password auth) from starting up.
        this.googleClientId = googleClientId;
    }

    private GoogleIdTokenVerifier getVerifier() {
        GoogleIdTokenVerifier existing = verifier;
        if (existing != null) {
            return existing;
        }
        synchronized (this) {
            if (verifier == null) {
                verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();
            }
            return verifier;
        }
    }

    public GoogleUserInfo verify(String idTokenString) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new GoogleAuthException("Google sign-in is not configured on this server yet");
        }
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new GoogleAuthException("Google ID token is required");
        }

        GoogleIdToken idToken;
        try {
            idToken = getVerifier().verify(idTokenString);
        } catch (GeneralSecurityException | IOException | IllegalArgumentException e) {
            throw new GoogleAuthException("Google authentication failed. Please try again.");
        }

        if (idToken == null) {
            // Signature invalid, expired, wrong audience/issuer, etc.
            throw new GoogleAuthException("Google authentication failed. Please try again.");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();

        if (!Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw new GoogleAuthException("This Google account's email address is not verified");
        }

        String email = payload.getEmail();
        String googleId = payload.getSubject();
        String fullName = (String) payload.get("name");
        String firstName = (String) payload.get("given_name");
        String lastName = (String) payload.get("family_name");

        if (firstName == null || firstName.isBlank()) {
            firstName = deriveFirstName(fullName, email);
        }
        if (lastName == null || lastName.isBlank()) {
            lastName = deriveLastName(fullName);
        }

        return new GoogleUserInfo(googleId, email, firstName, lastName);
    }

    private String deriveFirstName(String fullName, String email) {
        if (fullName != null && !fullName.isBlank()) {
            return fullName.trim().split("\\s+")[0];
        }
        return (email != null && email.contains("@")) ? email.split("@")[0] : "Google";
    }

    private String deriveLastName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "User";
        }
        String[] parts = fullName.trim().split("\\s+");
        return parts.length > 1 ? parts[parts.length - 1] : "User";
    }
}
