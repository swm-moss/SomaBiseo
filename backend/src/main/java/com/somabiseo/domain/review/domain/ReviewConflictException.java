package com.somabiseo.domain.review.domain;

public class ReviewConflictException extends RuntimeException {
    public ReviewConflictException(String message) {
        super(message);
    }
}
