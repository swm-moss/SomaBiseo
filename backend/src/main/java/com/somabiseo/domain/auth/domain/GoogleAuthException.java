package com.somabiseo.domain.auth.domain;

public class GoogleAuthException extends RuntimeException {
    public GoogleAuthException(String message) {
        super(message);
    }

    public GoogleAuthException(String message, Throwable cause) {
        super(message, cause);
    }
}
