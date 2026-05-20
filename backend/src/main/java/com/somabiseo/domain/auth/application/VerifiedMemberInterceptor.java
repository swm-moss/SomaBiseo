package com.somabiseo.domain.auth.application;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class VerifiedMemberInterceptor implements HandlerInterceptor {
    private final GoogleAuthService googleAuthService;

    public VerifiedMemberInterceptor(GoogleAuthService googleAuthService) {
        this.googleAuthService = googleAuthService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        googleAuthService.requireVerifiedSession(request.getHeader("Authorization"));

        return true;
    }
}
