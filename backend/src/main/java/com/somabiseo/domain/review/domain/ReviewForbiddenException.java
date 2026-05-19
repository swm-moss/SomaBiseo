package com.somabiseo.domain.review.domain;

public class ReviewForbiddenException extends RuntimeException {
    public ReviewForbiddenException(String message) {
        super(message);
    }
}
