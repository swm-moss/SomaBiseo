package com.somabiseo.domain.auth.domain;

public class GoogleAuthUnauthorizedException extends RuntimeException {
    public GoogleAuthUnauthorizedException(String message) {
        super(message);
    }
}
