package com.somabiseo.domain.source.infrastructure;

import com.somabiseo.domain.source.domain.NoticeSourceItem;
import com.somabiseo.domain.source.domain.SomaEventSourceItem;
import com.somabiseo.domain.source.domain.SomaSourceClient;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.List;

@Component
public class MockSomaSourceClient implements SomaSourceClient {
    @Override
    public List<NoticeSourceItem> fetchNotices() {
        return List.of(new NoticeSourceItem(
                "mock-notice-1",
                "Mock 공지",
                "초기 MVP에서는 실제 SOMA 웹 연동 대신 mock 또는 수동 import를 사용합니다.",
                "https://swmaestro.org",
                false,
                OffsetDateTime.parse("2026-05-18T09:00:00+09:00")
        ));
    }

    @Override
    public List<SomaEventSourceItem> fetchEvents() {
        return List.of(new SomaEventSourceItem(
                "mock-event-1",
                "LECTURE",
                "Mock 멘토특강",
                "Mock 멘토",
                "온라인",
                OffsetDateTime.parse("2026-05-20T15:00:00+09:00"),
                OffsetDateTime.parse("2026-05-20T17:00:00+09:00"),
                "https://swmaestro.org"
        ));
    }
}
