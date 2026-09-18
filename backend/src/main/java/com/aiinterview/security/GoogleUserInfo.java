package com.aiinterview.security;

/**
 * Verified identity claims extracted from a Google ID token. This is only
 * ever built after {@link GoogleTokenVerifierService} has cryptographically
 * verified the token, so it is safe to trust these values.
 */
public record GoogleUserInfo(String googleId, String email, String firstName, String lastName) {
}
