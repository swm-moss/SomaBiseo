package com.somabiseo.domain.calendar.application;

import com.somabiseo.domain.calendar.domain.CalendarConnectionResponse;
import com.somabiseo.domain.calendar.domain.CalendarConflictStatusResponse;
import com.somabiseo.domain.calendar.domain.CalendarEventLinkResponse;
import com.somabiseo.domain.calendar.domain.GoogleCalendarConnectionException;
import com.somabiseo.domain.calendar.domain.GoogleCalendarClient;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventLink;
import com.somabiseo.domain.calendar.domain.GoogleCalendarEventResponse;
import com.somabiseo.domain.calendar.infrastructure.GoogleCalendarEventLinkRepository;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.infrastructure.CachedPortalEventRepository;
import com.somabiseo.domain.somaevent.application.SomaEventService;
import com.somabiseo.domain.somaevent.domain.BusyBlockResponse;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.somabiseo.global.exception.NotFoundException;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CalendarService {
    private static final String EVENT_ID_MARKER_PREFIX = "SomaBiseo Event ID: ";
    private static final CalendarConnectionResponse DISCONNECTED =
            new CalendarConnectionResponse(false, null, null, null);

    private final SomaEventService somaEventService;
    private final GoogleCalendarClient googleCalendarClient;
    private final CachedPortalEventRepository cachedPortalEventRepository;
    private final GoogleCalendarEventLinkRepository googleCalendarEventLinkRepository;
    private final ObjectMapper objectMapper;

    public CalendarService(
            SomaEventService somaEventService,
            GoogleCalendarClient googleCalendarClient,
            CachedPortalEventRepository cachedPortalEventRepository,
            GoogleCalendarEventLinkRepository googleCalendarEventLinkRepository,
            ObjectMapper objectMapper
    ) {
        this.somaEventService = somaEventService;
        this.googleCalendarClient = googleCalendarClient;
        this.cachedPortalEventRepository = cachedPortalEventRepository;
        this.googleCalendarEventLinkRepository = googleCalendarEventLinkRepository;
        this.objectMapper = objectMapper;
    }

    public String getConnectUrl(String calendarSessionId) {
        return googleCalendarClient.buildAuthorizationUrl(calendarSessionId);
    }

    public CalendarConnectionResponse connect(String calendarSessionId, String code, String state) {
        googleCalendarClient.exchangeAuthorizationCode(calendarSessionId, code, state);

        return getConnection(calendarSessionId);
    }

    public CalendarConnectionResponse getConnection(String calendarSessionId) {
        if (!googleCalendarClient.isConnected(calendarSessionId)) {
            return DISCONNECTED;
        }

        return new CalendarConnectionResponse(
                true,
                googleCalendarClient.googleAccountEmail(calendarSessionId),
                googleCalendarClient.calendarId(),
                "기본 캘린더"
        );
    }

    public List<GoogleCalendarEventResponse> getGoogleEvents(
            String calendarSessionId,
            OffsetDateTime from,
            OffsetDateTime to
    ) {
        if (!googleCalendarClient.isConnected(calendarSessionId)) {
            return List.of();
        }

        return googleCalendarClient.findEvents(calendarSessionId, from, to);
    }

    public CalendarConnectionResponse disconnect(String calendarSessionId) {
        googleCalendarClient.disconnect(calendarSessionId);

        return DISCONNECTED;
    }

    public CalendarConflictResponse getConflict(String calendarSessionId, String eventId) {
        CalendarEvent event = findCalendarEvent(eventId);

        return getConflict(calendarSessionId, eventId, event.startAt(), event.endAt());
    }

    public CalendarConflictResponse getConflict(String calendarSessionId, OffsetDateTime startAt, OffsetDateTime endAt) {
        return getConflict(calendarSessionId, null, startAt, endAt);
    }

    public List<CalendarConflictStatusResponse> getConflictStatuses(String calendarSessionId, List<String> eventIds) {
        List<String> distinctEventIds = eventIds == null
                ? List.of()
                : eventIds.stream()
                .filter((eventId) -> eventId != null && !eventId.isBlank())
                .distinct()
                .limit(50)
                .toList();

        if (distinctEventIds.isEmpty()) {
            return List.of();
        }

        List<CalendarEventWithId> events = distinctEventIds.stream()
                .map((eventId) -> new CalendarEventWithId(eventId, findCalendarEvent(eventId)))
                .toList();
        List<CalendarEventWithId> validEvents = events.stream()
                .filter((event) -> hasValidPeriod(event.event()))
                .toList();

        if (!googleCalendarClient.isConnected(calendarSessionId) || validEvents.isEmpty()) {
            return events.stream()
                    .map((event) -> new CalendarConflictStatusResponse(event.eventId(), false, false, List.of()))
                    .toList();
        }

        OffsetDateTime from = validEvents.stream()
                .map((event) -> event.event().startAt())
                .min(Comparator.naturalOrder())
                .orElseThrow();
        OffsetDateTime to = validEvents.stream()
                .map((event) -> event.event().endAt())
                .max(Comparator.naturalOrder())
                .orElseThrow();
        List<GoogleCalendarEventResponse> googleEvents = googleCalendarClient.findEvents(calendarSessionId, from, to);
        String calendarId = googleCalendarClient.calendarId();
        Map<String, GoogleCalendarEventLink> linkByEventId = googleCalendarEventLinkRepository
                .findByCalendarSessionIdAndSourceIdInAndCalendarId(calendarSessionId, distinctEventIds, calendarId)
                .stream()
                .filter(GoogleCalendarEventLink::isCreated)
                .collect(Collectors.toMap(
                        GoogleCalendarEventLink::getSourceId,
                        (link) -> link,
                        (first, second) -> first,
                        LinkedHashMap::new
                ));

        return events.stream()
                .map((event) -> toConflictStatus(event, googleEvents, linkByEventId.get(event.eventId())))
                .toList();
    }

    private CalendarConflictResponse getConflict(
            String calendarSessionId,
            String eventId,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        if (startAt == null || endAt == null || !startAt.isBefore(endAt)) {
            return new CalendarConflictResponse(false, List.of());
        }

        if (!googleCalendarClient.isConnected(calendarSessionId)) {
            return new CalendarConflictResponse(false, List.of());
        }

        List<BusyBlockResponse> busyBlocks = googleCalendarClient.findEvents(calendarSessionId, startAt, endAt).stream()
                .filter((event) -> eventId == null || !isSomaBiseoEvent(event, eventId))
                .filter((event) -> overlaps(startAt, endAt, event.startAt(), event.endAt()))
                .map((event) -> new BusyBlockResponse(
                        event.id(),
                        event.title(),
                        event.startAt(),
                        event.endAt()
                ))
                .toList();

        return new CalendarConflictResponse(!busyBlocks.isEmpty(), busyBlocks);
    }

    private CalendarConflictStatusResponse toConflictStatus(
            CalendarEventWithId event,
            List<GoogleCalendarEventResponse> googleEvents,
            GoogleCalendarEventLink link
    ) {
        if (!hasValidPeriod(event.event())) {
            return new CalendarConflictStatusResponse(event.eventId(), false, false, List.of());
        }

        Set<String> linkedGoogleEventIds = link != null && link.getGoogleEventId() != null
                ? Set.of(link.getGoogleEventId())
                : Set.of();
        boolean alreadyAdded = googleEvents.stream()
                .anyMatch((googleEvent) ->
                        isSomaBiseoEvent(googleEvent, event.eventId())
                                || linkedGoogleEventIds.contains(googleEvent.id())
                );
        List<BusyBlockResponse> busyBlocks = googleEvents.stream()
                .filter((googleEvent) -> !isSomaBiseoEvent(googleEvent, event.eventId()))
                .filter((googleEvent) -> !linkedGoogleEventIds.contains(googleEvent.id()))
                .filter((googleEvent) -> overlaps(
                        event.event().startAt(),
                        event.event().endAt(),
                        googleEvent.startAt(),
                        googleEvent.endAt()
                ))
                .map((googleEvent) -> new BusyBlockResponse(
                        googleEvent.id(),
                        googleEvent.title(),
                        googleEvent.startAt(),
                        googleEvent.endAt()
                ))
                .toList();

        return new CalendarConflictStatusResponse(
                event.eventId(),
                alreadyAdded,
                !busyBlocks.isEmpty(),
                busyBlocks
        );
    }

    public CalendarEventLinkResponse getEventLink(String calendarSessionId, String eventId) {
        String calendarId = googleCalendarClient.calendarId();
        GoogleCalendarEventLink link = findExistingLink(calendarSessionId, eventId, calendarId);

        if (link == null) {
            return recoverEventLink(calendarSessionId, eventId, calendarId);
        }

        if (!link.isCreated()) {
            return new CalendarEventLinkResponse(eventId, null, calendarId, false);
        }

        if (googleCalendarClient.findEvent(calendarSessionId, link.getGoogleEventId()).isEmpty()) {
            googleCalendarEventLinkRepository.delete(link);

            return new CalendarEventLinkResponse(eventId, null, calendarId, false);
        }

        return new CalendarEventLinkResponse(
                eventId,
                link.getGoogleEventId(),
                link.getCalendarId(),
                true
        );
    }

    private CalendarEventLinkResponse recoverEventLink(String calendarSessionId, String eventId, String calendarId) {
        CalendarEvent event = findCalendarEvent(eventId);
        GoogleCalendarEventResponse recoveredEvent = findRecoverableGoogleEvent(calendarSessionId, eventId, event);
        if (recoveredEvent == null) {
            return new CalendarEventLinkResponse(eventId, null, calendarId, false);
        }

        GoogleCalendarEventLink recoveredLink = reserveLink(calendarSessionId, eventId, calendarId);
        recoveredLink.markCreated(recoveredEvent.id());
        googleCalendarEventLinkRepository.save(recoveredLink);

        return new CalendarEventLinkResponse(
                eventId,
                recoveredEvent.id(),
                recoveredEvent.calendarId(),
                true
        );
    }

    public CalendarEventLinkResponse addEvent(String calendarSessionId, String eventId) {
        CalendarEvent event = findCalendarEvent(eventId);
        String calendarId = googleCalendarClient.calendarId();

        if (!googleCalendarClient.isConnected(calendarSessionId)) {
            throw new GoogleCalendarConnectionException("Google Calendar 연결이 필요합니다.");
        }

        if (event.startAt() == null || event.endAt() == null || !event.startAt().isBefore(event.endAt())) {
            throw new IllegalArgumentException("캘린더에 추가할 일정 시간이 올바르지 않습니다.");
        }

        GoogleCalendarEventLink link = findExistingLink(calendarSessionId, eventId, calendarId);
        if (link != null) {
            if (!link.isCreated() && link.isStalePending(Instant.now())) {
                googleCalendarEventLinkRepository.delete(link);
                link = null;
            } else if (!link.isCreated()) {
                throw new GoogleCalendarConnectionException(
                        "Google Calendar 추가가 진행 중입니다. 잠시 후 다시 시도해 주세요."
                );
            } else if (googleCalendarClient.findEvent(calendarSessionId, link.getGoogleEventId()).isEmpty()) {
                googleCalendarEventLinkRepository.delete(link);
                link = null;
            } else {
                return new CalendarEventLinkResponse(
                        eventId,
                        link.getGoogleEventId(),
                        link.getCalendarId(),
                        true
                );
            }
        }

        link = reserveLink(calendarSessionId, eventId, calendarId);
        GoogleCalendarEventResponse googleEvent;

        try {
            googleEvent = googleCalendarClient.insertEvent(
                    calendarSessionId,
                    event.displayTitle(),
                    event.description(),
                    eventId,
                    event.type(),
                    event.location(),
                    event.startAt(),
                    event.endAt()
            );
        } catch (RuntimeException exception) {
            googleCalendarEventLinkRepository.delete(link);
            throw exception;
        }

        link.markCreated(googleEvent.id());
        googleCalendarEventLinkRepository.save(link);

        return new CalendarEventLinkResponse(
                eventId,
                googleEvent.id(),
                googleEvent.calendarId(),
                false
        );
    }

    private GoogleCalendarEventLink findExistingLink(String calendarSessionId, String eventId, String calendarId) {
        return googleCalendarEventLinkRepository.findByCalendarSessionIdAndSourceIdAndCalendarId(
                calendarSessionId,
                eventId,
                calendarId
        ).orElse(null);
    }

    private GoogleCalendarEventLink reserveLink(String calendarSessionId, String eventId, String calendarId) {
        int inserted = googleCalendarEventLinkRepository.insertPending(calendarSessionId, eventId, calendarId);

        if (inserted == 0) {
            throw new GoogleCalendarConnectionException(
                    "Google Calendar 추가가 진행 중입니다. 잠시 후 다시 시도해 주세요."
            );
        }

        return findExistingLink(calendarSessionId, eventId, calendarId);
    }

    private GoogleCalendarEventResponse findRecoverableGoogleEvent(
            String calendarSessionId,
            String eventId,
            CalendarEvent event
    ) {
        if (event.startAt() == null || event.endAt() == null || !event.startAt().isBefore(event.endAt())) {
            return null;
        }

        return googleCalendarClient.findEvents(calendarSessionId, event.startAt(), event.endAt()).stream()
                .filter((googleEvent) -> isSomaBiseoEvent(googleEvent, eventId))
                .findFirst()
                .orElse(null);
    }

    private String eventIdMarker(String eventId) {
        return EVENT_ID_MARKER_PREFIX + eventId;
    }

    private boolean isSomaBiseoEvent(GoogleCalendarEventResponse event, String eventId) {
        if (eventId == null || eventId.isBlank()) {
            return false;
        }

        return eventId.equals(event.somaBiseoEventId()) || hasEventIdMarker(event.description(), eventId);
    }

    private boolean hasEventIdMarker(String description, String eventId) {
        if (description == null || eventId == null || eventId.isBlank()) {
            return false;
        }

        String marker = eventIdMarker(eventId);

        return description.lines()
                .map(String::trim)
                .anyMatch(marker::equals);
    }

    private boolean overlaps(
            OffsetDateTime targetStartAt,
            OffsetDateTime targetEndAt,
            OffsetDateTime busyStartAt,
            OffsetDateTime busyEndAt
    ) {
        return targetStartAt.isBefore(busyEndAt) && busyStartAt.isBefore(targetEndAt);
    }

    private boolean hasValidPeriod(CalendarEvent event) {
        return event.startAt() != null && event.endAt() != null && event.startAt().isBefore(event.endAt());
    }

    private CalendarEvent findCalendarEvent(String eventId) {
        if (eventId == null || eventId.isBlank()) {
            throw new NotFoundException("일정을 찾을 수 없습니다.");
        }

        return cachedPortalEventRepository.findBySourceId(eventId)
                .map((event) -> event.toResponse(objectMapper))
                .map(this::toCalendarEvent)
                .orElseGet(() -> toCalendarEvent(somaEventService.findById(eventId)));
    }

    private CalendarEvent toCalendarEvent(SomaPortalEventResponse event) {
        return new CalendarEvent(
                event.title(),
                event.topic(),
                event.type().name(),
                event.contentText(),
                event.location(),
                event.startAt(),
                event.endAt()
        );
    }

    private CalendarEvent toCalendarEvent(SomaEventResponse event) {
        return new CalendarEvent(
                event.title(),
                event.topic(),
                event.type().name(),
                event.description(),
                event.location(),
                event.startAt(),
                event.endAt()
        );
    }

    private record CalendarEvent(
            String title,
            String topic,
            String type,
            String description,
            String location,
            OffsetDateTime startAt,
            OffsetDateTime endAt
    ) {
        String displayTitle() {
            return topic == null || topic.isBlank() ? title : topic;
        }
    }

    private record CalendarEventWithId(
            String eventId,
            CalendarEvent event
    ) {
    }
}
