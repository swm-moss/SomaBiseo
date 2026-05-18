package com.somabiseo.domain.somaevent.domain;

import java.util.List;

public record CalendarConflictResponse(
        boolean hasConflict,
        List<BusyBlockResponse> busyBlocks
) {
}
