package com.somabiseo.domain.auth.domain;

public class InviteVerificationLockedException extends RuntimeException {
    public InviteVerificationLockedException(String message) {
        super(message);
    }
}
