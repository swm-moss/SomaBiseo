package com.somabiseo.domain.notice.application;

import com.somabiseo.domain.notice.domain.NoticeCategory;
import com.somabiseo.domain.notice.domain.NoticeResponse;
import com.somabiseo.global.exception.NotFoundException;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;

@Service
public class NoticeService {
    private final List<NoticeResponse> notices = List.of(
            new NoticeResponse(
                    "notice-1",
                    "soma-notice-20260518-lecture",
                    "5월 멘토특강 신청 일정 안내",
                    "5월 멘토특강 신청 기간과 참여 방법을 안내합니다.",
                    NoticeCategory.LECTURE,
                    "https://swmaestro.org",
                    true,
                    OffsetDateTime.parse("2026-05-18T07:30:00+09:00"),
                    OffsetDateTime.parse("2026-05-19T18:00:00+09:00")
            ),
            new NoticeResponse(
                    "notice-2",
                    "soma-notice-20260517-office-hour",
                    "자유멘토링 운영 시간 변경",
                    "이번 주 자유멘토링 일부 시간이 조정됐습니다.",
                    NoticeCategory.MENTORING,
                    "https://swmaestro.org",
                    false,
                    OffsetDateTime.parse("2026-05-17T16:00:00+09:00"),
                    null
            )
    );

    public List<NoticeResponse> findAll(Boolean important) {
        return notices.stream()
                .filter(notice -> important == null || notice.important() == important)
                .sorted(Comparator.comparing(NoticeResponse::publishedAt).reversed())
                .toList();
    }

    public NoticeResponse findById(String noticeId) {
        return notices.stream()
                .filter(notice -> notice.id().equals(noticeId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("공지사항을 찾을 수 없습니다."));
    }
}
