package com.somabiseo.domain.portal.presentation;

import com.somabiseo.domain.eventsummary.application.EventAiSummaryService;
import com.somabiseo.domain.eventsummary.domain.EventAiSummaryResponse;
import com.somabiseo.domain.eventsummary.presentation.EventAiSummaryRequest;
import com.somabiseo.domain.portal.application.SomaPortalService;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalEventSort;
import com.somabiseo.domain.portal.domain.SomaPortalLoginResponse;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationResponse;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import com.somabiseo.domain.portal.domain.SomaPortalPageResponse;
import com.somabiseo.domain.portal.domain.SomaPortalUnauthorizedException;
import com.somabiseo.domain.somaevent.domain.EventMode;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.global.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SomaPortalController {
    private final SomaPortalService portalService;
    private final EventAiSummaryService eventAiSummaryService;

    public SomaPortalController(SomaPortalService portalService, EventAiSummaryService eventAiSummaryService) {
        this.portalService = portalService;
        this.eventAiSummaryService = eventAiSummaryService;
    }

    @PostMapping("/api/soma/login")
    ApiResponse<SomaPortalLoginResponse> login(@Valid @RequestBody SomaPortalLoginRequest request) {
        return ApiResponse.ok(portalService.login(request.username(), request.password()));
    }

    @DeleteMapping("/api/soma/logout")
    ApiResponse<Void> logout(@RequestParam String sessionId) {
        portalService.logout(sessionId);

        return ApiResponse.ok(null);
    }

    @GetMapping("/api/soma/notices")
    ApiResponse<SomaPortalPageResponse<SomaPortalNoticeResponse>> getNotices(
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "1") int page
    ) {
        if (!hasText(sessionId)) {
            return ApiResponse.ok(portalService.getPublicNotices(page));
        }

        return ApiResponse.ok(portalService.getNotices(sessionId, page));
    }

    @GetMapping("/api/soma/events")
    ApiResponse<SomaPortalPageResponse<SomaPortalEventResponse>> getEvents(
            @RequestParam(required = false) String sessionId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "LECTURE_DATE_DESC") SomaPortalEventSort sort,
            @RequestParam(required = false) EventType type,
            @RequestParam(required = false) EventMode mode,
            @RequestParam(required = false) String q
    ) {
        if (!hasText(sessionId)) {
            return ApiResponse.ok(portalService.getPublicEvents(page, sort, type, mode, q));
        }

        return ApiResponse.ok(portalService.getEvents(sessionId, page, sort, type, mode, q));
    }

    @GetMapping("/api/soma/events/detail")
    ApiResponse<SomaPortalEventResponse> getEventDetail(
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String sourceUrl,
            @RequestParam(required = false) String sourceId
    ) {
        if (!hasText(sessionId)) {
            if (hasText(sourceId)) {
                return ApiResponse.ok(portalService.getPublicEventDetailBySourceId(sourceId));
            }

            return ApiResponse.ok(portalService.getPublicEventDetail(sourceUrl));
        }

        return ApiResponse.ok(portalService.getEventDetail(sessionId, sourceUrl));
    }

    @PostMapping("/api/soma/events/summary")
    ApiResponse<EventAiSummaryResponse> summarizeEvent(
            @Valid @RequestBody EventAiSummaryRequest request
    ) {
        SomaPortalEventResponse event = portalService.getPublicEventDetail(request.sourceUrl());

        return ApiResponse.ok(eventAiSummaryService.getOrCreate(event));
    }

    @PostMapping("/api/soma/mento-lecs/{qustnrSn}/apply")
    ApiResponse<SomaPortalMentoLecApplicationResponse> applyMentoLec(
            @PathVariable String qustnrSn,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        String sessionId = bearerSessionId(authorization);

        return ApiResponse.ok(portalService.applyMentoLec(sessionId, qustnrSn));
    }

    @DeleteMapping("/api/soma/mento-lecs/{qustnrSn}/application")
    ApiResponse<SomaPortalMentoLecApplicationResponse> cancelMentoLec(
            @PathVariable String qustnrSn,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        String sessionId = bearerSessionId(authorization);

        return ApiResponse.ok(portalService.cancelMentoLec(sessionId, qustnrSn));
    }

    private String bearerSessionId(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 sessionId가 필요합니다.");
        }

        String sessionId = authorization.substring("Bearer ".length()).trim();

        if (sessionId.isBlank()) {
            throw new SomaPortalUnauthorizedException("SOMA 포털 sessionId가 필요합니다.");
        }

        return sessionId;
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }

    record SomaPortalLoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {
    }
}
