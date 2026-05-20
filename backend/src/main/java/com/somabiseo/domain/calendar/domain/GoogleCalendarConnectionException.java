package com.somabiseo.domain.calendar.domain;

public class GoogleCalendarConnectionException extends RuntimeException {
    public GoogleCalendarConnectionException(String message) {
        super(message);
    }

    public GoogleCalendarConnectionException(String message, Throwable cause) {
        super(message, cause);
    }
}
