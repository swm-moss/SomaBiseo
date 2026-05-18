package com.somabiseo.domain.somaevent.application;

import com.somabiseo.domain.somaevent.domain.BusyBlockResponse;
import com.somabiseo.domain.somaevent.domain.CalendarConflictResponse;
import com.somabiseo.domain.somaevent.domain.EventStatus;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEventResponse;
import com.somabiseo.global.exception.NotFoundException;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class SomaEventService {
    private final BusyBlockResponse teamMeeting = new BusyBlockResponse(
            "busy-1",
            "팀 회의",
            OffsetDateTime.parse("2026-05-20T15:00:00+09:00"),
            OffsetDateTime.parse("2026-05-20T16:00:00+09:00")
    );

    private final List<SomaEventResponse> events = List.of(
            new SomaEventResponse(
                    "event-1",
                    "soma-lecture-20260520-ai-product",
                    EventType.LECTURE,
                    "AI 제품을 실제 사용자에게 붙이는 법",
                    "정다은 멘토",
                    "AI Product",
                    "프로토타입을 실사용 흐름으로 옮길 때 필요한 제품 판단과 지표를 다룹니다.",
                    "부산센터 3층 세미나실",
                    OffsetDateTime.parse("2026-05-20T15:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-20T17:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-18T10:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-19T18:00:00+09:00"),
                    40,
                    EventStatus.OPEN,
                    "https://swmaestro.org",
                    new CalendarConflictResponse(true, List.of(teamMeeting))
            ),
            new SomaEventResponse(
                    "event-2",
                    "soma-mentoring-20260522-backend",
                    EventType.MENTORING,
                    "백엔드 API 설계 점검",
                    "이현우 멘토",
                    "Backend",
                    "도메인 경계, 예외 처리, API 응답 계약을 중심으로 프로젝트 구조를 봅니다.",
                    "온라인",
                    OffsetDateTime.parse("2026-05-22T10:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-22T12:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-18T09:00:00+09:00"),
                    OffsetDateTime.parse("2026-05-21T12:00:00+09:00"),
                    8,
                    EventStatus.OPEN,
                    "https://swmaestro.org",
                    new CalendarConflictResponse(false, List.of())
            )
    );

    public List<SomaEventResponse> findAll(EventType type) {
        return events.stream()
                .filter(event -> type == null || event.type() == type)
                .sorted(Comparator.comparing(SomaEventResponse::startAt))
                .toList();
    }

    public SomaEventResponse findById(String eventId) {
        return events.stream()
                .filter(event -> event.id().equals(eventId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("일정을 찾을 수 없습니다."));
    }
}
