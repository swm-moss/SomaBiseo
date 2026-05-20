package com.somabiseo.domain.calendar.domain;

import com.somabiseo.domain.somaevent.domain.BusyBlockResponse;

import java.util.List;

public record CalendarConflictStatusResponse(
        String eventId,
        boolean alreadyAdded,
        boolean hasConflict,
        List<BusyBlockResponse> busyBlocks
) {
}
