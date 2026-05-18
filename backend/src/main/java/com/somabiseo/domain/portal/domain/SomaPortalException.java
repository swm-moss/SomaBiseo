package com.somabiseo.domain.portal.domain;

public class SomaPortalException extends RuntimeException {
    public SomaPortalException(String message) {
        super(message);
    }

    public SomaPortalException(String message, Throwable cause) {
        super(message, cause);
    }
}
