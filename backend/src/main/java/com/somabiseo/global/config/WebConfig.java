package com.somabiseo.global.config;

import com.somabiseo.domain.auth.infrastructure.GoogleOAuthProperties;
import com.somabiseo.domain.calendar.infrastructure.GoogleCalendarProperties;
import com.somabiseo.domain.eventsummary.infrastructure.OpenAiProperties;
import com.somabiseo.domain.portal.infrastructure.SomaPortalProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
@EnableConfigurationProperties({
        CorsProperties.class,
        SomaPortalProperties.class,
        OpenAiProperties.class,
        GoogleOAuthProperties.class,
        GoogleCalendarProperties.class
})
public class WebConfig implements WebMvcConfigurer {
    private final CorsProperties corsProperties;

    public WebConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
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
}
