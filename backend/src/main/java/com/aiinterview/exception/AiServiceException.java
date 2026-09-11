package com.aiinterview.exception;

import org.springframework.http.HttpStatus;

public class AiServiceException extends ApiException {
    public AiServiceException(String message) {
        super(message, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
