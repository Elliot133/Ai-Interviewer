package com.aiinterview.exception;

import org.springframework.http.HttpStatus;

public class GoogleAuthException extends ApiException {
    public GoogleAuthException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}
