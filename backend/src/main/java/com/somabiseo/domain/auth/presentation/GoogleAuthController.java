package com.somabiseo.domain.auth.presentation;

import com.somabiseo.domain.auth.application.GoogleAuthService;
import com.somabiseo.domain.auth.domain.GoogleAuthSessionResponse;
import com.somabiseo.global.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class GoogleAuthController {
    private final GoogleAuthService googleAuthService;

    public GoogleAuthController(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @GetMapping("/api/auth/google/connect-url")
    ApiResponse<ConnectUrlResponse> getLoginUrl(@RequestParam(required = false) String returnTo) {
        return ApiResponse.ok(new ConnectUrlResponse(googleAuthService.buildLoginUrl(returnTo)));
    }

    @GetMapping({"/api/auth/me", "/api/me"})
    ApiResponse<GoogleAuthSessionResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        return ApiResponse.ok(googleAuthService.getCurrentSession(authorization));
    }

    @DeleteMapping("/api/auth/logout")
    ApiResponse<Void> logout(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        googleAuthService.logout(authorization);

        return ApiResponse.ok(null);
    }

    @PostMapping("/api/auth/invite/verify")
    ApiResponse<GoogleAuthSessionResponse> verifyInviteCode(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody InviteVerificationRequest request
    ) {
        return ApiResponse.ok(googleAuthService.verifyInviteCode(authorization, request.code()));
    }

    @GetMapping("/api/calendar/google/connect-url")
    ApiResponse<ConnectUrlResponse> getCalendarConnectUrl(@RequestParam(required = false) String returnTo) {
        return ApiResponse.ok(new ConnectUrlResponse(googleAuthService.buildCalendarConnectUrl(returnTo)));
    }

    @GetMapping("/api/calendar/google/callback")
    RedirectView callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error
    ) {
        RedirectView redirectView = new RedirectView(googleAuthService.handleCallback(code, state, error));
        redirectView.setExposeModelAttributes(false);

        return redirectView;
    }

    record ConnectUrlResponse(String url) {
    }
}
