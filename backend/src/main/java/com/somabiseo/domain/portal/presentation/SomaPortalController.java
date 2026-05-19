package com.somabiseo.domain.portal.presentation;

import com.somabiseo.domain.portal.application.SomaPortalService;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalLoginResponse;
import com.somabiseo.domain.portal.domain.SomaPortalMentoLecApplicationResponse;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import com.somabiseo.domain.portal.domain.SomaPortalPageResponse;
import com.somabiseo.domain.portal.domain.SomaPortalUnauthorizedException;
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

    public SomaPortalController(SomaPortalService portalService) {
        this.portalService = portalService;
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
            @RequestParam String sessionId,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ApiResponse.ok(portalService.getNotices(sessionId, page));
    }

    @GetMapping("/api/soma/events")
    ApiResponse<SomaPortalPageResponse<SomaPortalEventResponse>> getEvents(
            @RequestParam String sessionId,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ApiResponse.ok(portalService.getEvents(sessionId, page));
    }

    @GetMapping("/api/soma/events/detail")
    ApiResponse<SomaPortalEventResponse> getEventDetail(
            @RequestParam String sessionId,
            @RequestParam String sourceUrl
    ) {
        return ApiResponse.ok(portalService.getEventDetail(sessionId, sourceUrl));
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

    record SomaPortalLoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {
    }
}
