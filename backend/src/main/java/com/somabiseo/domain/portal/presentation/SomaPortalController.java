package com.somabiseo.domain.portal.presentation;

import com.somabiseo.domain.portal.application.SomaPortalService;
import com.somabiseo.domain.portal.domain.SomaPortalEventResponse;
import com.somabiseo.domain.portal.domain.SomaPortalLoginResponse;
import com.somabiseo.domain.portal.domain.SomaPortalNoticeResponse;
import com.somabiseo.global.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
    ApiResponse<List<SomaPortalNoticeResponse>> getNotices(
            @RequestParam String sessionId,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ApiResponse.ok(portalService.getNotices(sessionId, page));
    }

    @GetMapping("/api/soma/events")
    ApiResponse<List<SomaPortalEventResponse>> getEvents(
            @RequestParam String sessionId,
            @RequestParam(defaultValue = "1") int page
    ) {
        return ApiResponse.ok(portalService.getEvents(sessionId, page));
    }

    record SomaPortalLoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {
    }
}
