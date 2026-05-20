package com.somabiseo.domain.somaevent.domain;

public enum EventMode {
    ONLINE("온라인"),
    OFFLINE("오프라인");

    private final String keyword;

    EventMode(String keyword) {
        this.keyword = keyword;
    }

    public String keyword() {
        return keyword;
    }
}
