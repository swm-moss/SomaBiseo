package com.somabiseo.domain.portal.domain;

public record SomaPortalMentoLecApplicationDetail(
        String qustnrSn,
        int applyCnt,
        int appCnt,
        String applicationId
) {
    public boolean applied() {
        return applicationId != null && !applicationId.isBlank();
    }
}
