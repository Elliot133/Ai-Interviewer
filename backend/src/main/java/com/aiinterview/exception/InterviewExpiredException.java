package com.aiinterview.exception;

import org.springframework.http.HttpStatus;

public class InterviewExpiredException extends ApiException {
    public InterviewExpiredException(String message) {
        super(message, HttpStatus.GONE);
    }
}
