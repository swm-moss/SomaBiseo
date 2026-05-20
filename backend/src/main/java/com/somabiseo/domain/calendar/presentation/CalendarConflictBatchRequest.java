package com.somabiseo.domain.calendar.presentation;

import java.util.List;

public record CalendarConflictBatchRequest(
        List<String> eventIds
) {
}
