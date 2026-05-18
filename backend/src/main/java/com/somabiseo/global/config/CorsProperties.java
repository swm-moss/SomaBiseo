package com.somabiseo.global.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@ConfigurationProperties(prefix = "somabiseo.cors")
public record CorsProperties(
        List<String> allowedOrigins
) {
}
