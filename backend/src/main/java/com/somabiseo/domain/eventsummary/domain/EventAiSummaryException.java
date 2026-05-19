package com.somabiseo.domain.eventsummary.domain;

public class EventAiSummaryException extends RuntimeException {
    public EventAiSummaryException(String message) {
        super(message);
    }

    public EventAiSummaryException(String message, Throwable cause) {
        super(message, cause);
    }
}
