package com.somabiseo.domain.portal.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "somabiseo.portal")
public record SomaPortalProperties(
        String baseUrl,
        String loginPagePath,
        String loginCheckPath,
        String loginSubmitPath,
        String noticeListPath,
        String eventListPath,
        long sessionTtlMinutes
) {
}
