package com.somabiseo.domain.calendar.application;

import com.somabiseo.domain.calendar.domain.CalendarEventLinkResponse;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class CalendarService {
    private final SomaEventService somaEventService;
    private final Set<String> addedEventIds = new HashSet<>();

    public CalendarService(SomaEventService somaEventService) {
        this.somaEventService = somaEventService;
    }

    public CalendarConflictResponse getConflict(String eventId) {
        return somaEventService.findById(eventId).conflict();
    }

    public CalendarEventLinkResponse addEvent(String eventId) {
        somaEventService.findById(eventId);
        boolean alreadyAdded = !addedEventIds.add(eventId);

        return new CalendarEventLinkResponse(
                eventId,
                "mock-google-event-" + eventId,
                "primary",
                alreadyAdded
        );
    }
}
