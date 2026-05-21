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
        String mentoLecViewPath,
        String mentoLecApplyPath,
        String mentoLecCancelPath,
        String operatorUsername,
        String operatorPassword,
        long sessionTtlMinutes,
        long cacheTtlMinutes,
        long detailCacheTtlSeconds,
        int syncPageLimit
) {
}
