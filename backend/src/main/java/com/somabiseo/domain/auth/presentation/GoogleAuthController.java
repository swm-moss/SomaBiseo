package com.somabiseo.domain.auth.presentation;

import com.somabiseo.domain.auth.application.GoogleAuthService;
import com.somabiseo.domain.auth.application.GoogleAuthService.GoogleAuthRedirectResult;
import com.somabiseo.domain.auth.domain.GoogleAuthSessionResponse;
import com.somabiseo.global.response.ApiResponse;
import jakarta.validation.Valid;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.time.Duration;
import java.time.Instant;

@RestController
public class GoogleAuthController {
    public static final String AUTH_SESSION_COOKIE = "somabiseo_auth_session";

    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @GetMapping({"/api/auth/google/connect-url", "/api/auth/google/login-url"})
    ApiResponse<ConnectUrlResponse> getLoginUrl(@RequestParam(required = false) String returnTo) {
        return ApiResponse.ok(new ConnectUrlResponse(googleAuthService.buildLoginUrl(returnTo)));
    }

    @GetMapping({"/api/auth/me", "/api/me"})
    ApiResponse<GoogleAuthSessionResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String sessionCookie
    ) {
        return ApiResponse.ok(googleAuthService.getCurrentSession(authorization, sessionCookie));
    }

    @DeleteMapping("/api/auth/logout")
    ApiResponse<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String sessionCookie,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        googleAuthService.logout(authorization, sessionCookie);
        expireAuthCookie(request, response);

        return ApiResponse.ok(null);
    }

    @PostMapping("/api/auth/invite/verify")
    ApiResponse<GoogleAuthSessionResponse> verifyInviteCode(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @CookieValue(value = AUTH_SESSION_COOKIE, required = false) String sessionCookie,
            @Valid @RequestBody InviteVerificationRequest request
    ) {
        return ApiResponse.ok(googleAuthService.verifyInviteCode(authorization, sessionCookie, request.code()));
    }

    @GetMapping("/api/calendar/google/connect-url")
    ApiResponse<ConnectUrlResponse> getCalendarConnectUrl(@RequestParam(required = false) String returnTo) {
        return ApiResponse.ok(new ConnectUrlResponse(googleAuthService.buildCalendarConnectUrl(returnTo)));
    }

    @GetMapping("/api/calendar/google/callback")
    RedirectView callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        GoogleAuthRedirectResult result = googleAuthService.handleCallback(code, state, error);

        if (result.sessionId() != null && result.expiresAt() != null) {
            setAuthCookie(request, response, result.sessionId(), result.expiresAt());
        }

        RedirectView redirectView = new RedirectView(result.redirectUrl());
        redirectView.setExposeModelAttributes(false);

        return redirectView;
    }

    record ConnectUrlResponse(String url) {
    }

    private void setAuthCookie(
            HttpServletRequest request,
            HttpServletResponse response,
            String sessionId,
            Instant expiresAt
    ) {
        boolean secureRequest = isSecureRequest(request);
        long maxAgeSeconds = Math.max(Duration.between(Instant.now(), expiresAt).toSeconds(), 0);
        ResponseCookie cookie = baseAuthCookie(sessionId, secureRequest)
                .httpOnly(true)
                .maxAge(maxAgeSeconds)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private void expireAuthCookie(HttpServletRequest request, HttpServletResponse response) {
        ResponseCookie cookie = baseAuthCookie("", isSecureRequest(request))
                .httpOnly(true)
                .maxAge(0)
                .build();

        response.addHeader("Set-Cookie", cookie.toString());
    }

    private ResponseCookie.ResponseCookieBuilder baseAuthCookie(String value, boolean secureRequest) {
        return ResponseCookie.from(AUTH_SESSION_COOKIE, value)
                .secure(secureRequest)
                .sameSite(secureRequest ? "None" : "Lax")
                .path("/");
    }

    private boolean isSecureRequest(HttpServletRequest request) {
        String forwardedProto = request.getHeader("X-Forwarded-Proto");

        return request.isSecure() || "https".equalsIgnoreCase(forwardedProto);
    }
}
