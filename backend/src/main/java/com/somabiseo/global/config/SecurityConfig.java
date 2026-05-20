package com.somabiseo.global.config;

import com.somabiseo.domain.auth.presentation.GoogleAuthController;
import jakarta.servlet.http.Cookie;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;

import java.util.Arrays;
import java.util.function.Supplier;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health", "/api/docs/**", "/v3/api-docs/**", "/actuator/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/soma/mento-lecs/*/apply").access(this::hasBearerSession)
                        .requestMatchers(HttpMethod.DELETE, "/api/soma/mento-lecs/*/application").access(this::hasBearerSession)
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().denyAll()
                )
                .build();
    }

    private AuthorizationDecision hasBearerSession(
            Supplier<Authentication> authentication,
            RequestAuthorizationContext context
    ) {
        String authorization = context.getRequest().getHeader("Authorization");
        boolean hasBearer = authorization != null
                && authorization.startsWith("Bearer ")
                && !authorization.substring("Bearer ".length()).isBlank();
        boolean hasCookie = context.getRequest().getCookies() != null
                && Arrays.stream(context.getRequest().getCookies())
                .filter((cookie) -> GoogleAuthController.AUTH_SESSION_COOKIE.equals(cookie.getName()))
                .map(Cookie::getValue)
                .anyMatch((value) -> value != null && !value.isBlank());

        return new AuthorizationDecision(hasBearer || hasCookie);
    }
}
