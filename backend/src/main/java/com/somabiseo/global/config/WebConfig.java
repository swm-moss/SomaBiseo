package com.somabiseo.global.config;

import com.somabiseo.domain.auth.application.VerifiedMemberInterceptor;
import com.somabiseo.domain.auth.infrastructure.GoogleOAuthProperties;
import com.somabiseo.domain.calendar.infrastructure.GoogleCalendarProperties;
import com.somabiseo.domain.auth.infrastructure.InviteCodeProperties;
import com.somabiseo.domain.eventsummary.infrastructure.OpenAiProperties;
import com.somabiseo.domain.portal.infrastructure.SomaPortalProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@EnableConfigurationProperties({
        CorsProperties.class,
        SomaPortalProperties.class,
        OpenAiProperties.class,
        GoogleOAuthProperties.class,
        GoogleCalendarProperties.class,
        InviteCodeProperties.class
})
public class WebConfig implements WebMvcConfigurer {
    private final CorsProperties corsProperties;
    private final VerifiedMemberInterceptor verifiedMemberInterceptor;

    public WebConfig(CorsProperties corsProperties, VerifiedMemberInterceptor verifiedMemberInterceptor) {
        this.corsProperties = corsProperties;
        this.verifiedMemberInterceptor = verifiedMemberInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        List<String> allowedOrigins = corsProperties.allowedOrigins() == null
                ? List.of("http://localhost:3000")
                : corsProperties.allowedOrigins();

        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(verifiedMemberInterceptor)
                .addPathPatterns(
                        "/api/soma/notices",
                        "/api/soma/events",
                        "/api/soma/events/detail",
                        "/api/soma/events/summary",
                        "/api/events/**",
                        "/api/reviews/**",
                        "/api/calendar/conflicts",
                        "/api/calendar/conflicts/batch",
                        "/api/calendar/events/**",
                        "/api/calendar/google/status",
                        "/api/calendar/google/events",
                        "/api/calendar/google/connection",
                        "/api/calendar/oauth/google/connect-url",
                        "/api/calendar/google/connect-url"
                );
    }
}
