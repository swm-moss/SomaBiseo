package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.ReviewFeedItem;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.review.presentation.ReviewFeedPageResponse;
import com.somabiseo.domain.somaevent.domain.EventType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReviewFeedQueryServiceTest {
    private static final Long VIEWER_USER_ID = 9L;

    private ReviewRepository reviewRepository;
    private ReviewFeedQueryService service;

    @BeforeEach
    void setUp() {
        reviewRepository = mock(ReviewRepository.class);
        service = new ReviewFeedQueryService(reviewRepository);
    }

    @Test
    void findFeed_필터값이_null이면_그대로_null로_전달() {
        when(reviewRepository.findFeed(any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.findFeed(VIEWER_USER_ID, null, null, null, 1, 10);

        verify(reviewRepository).findFeed(eq(null), eq(null), eq(null), eq(VIEWER_USER_ID), any(Pageable.class));
    }

    @Test
    void findFeed_필터값의_공백을_trim하고_빈문자열은_null로() {
        when(reviewRepository.findFeed(any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.findFeed(VIEWER_USER_ID, "  ", "   ", "  ", 1, 10);

        verify(reviewRepository).findFeed(eq(null), eq(null), eq(null), eq(VIEWER_USER_ID), any(Pageable.class));
    }

    @Test
    void findFeed_q와_eventId와_mentorName은_trim된_값으로_전달() {
        when(reviewRepository.findFeed(any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.findFeed(VIEWER_USER_ID, "  AI  ", "  soma-1  ", "  정다은  ", 2, 5);

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(reviewRepository).findFeed(eq("AI"), eq("soma-1"), eq("정다은"), eq(VIEWER_USER_ID), pageable.capture());
        assertThat(pageable.getValue().getPageNumber()).isEqualTo(1);
        assertThat(pageable.getValue().getPageSize()).isEqualTo(5);
    }

    @Test
    void findFeed_page는_1부터_시작하여_0_기반으로_변환되고_음수는_0으로_clamp() {
        when(reviewRepository.findFeed(any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.findFeed(VIEWER_USER_ID, null, null, null, 0, 10);

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(reviewRepository).findFeed(any(), any(), any(), any(), pageable.capture());
        assertThat(pageable.getValue().getPageNumber()).isEqualTo(0);
    }

    @Test
    void findFeed_size가_0이면_1로_올림() {
        when(reviewRepository.findFeed(any(), any(), any(), any(), any())).thenReturn(Page.empty());

        service.findFeed(VIEWER_USER_ID, null, null, null, 1, 0);

        ArgumentCaptor<Pageable> pageable = ArgumentCaptor.forClass(Pageable.class);
        verify(reviewRepository).findFeed(any(), any(), any(), any(), pageable.capture());
        assertThat(pageable.getValue().getPageSize()).isEqualTo(1);
    }

    @Test
    void findFeed_응답은_1_기반_페이지로_변환되고_items_그대로_전달() {
        ReviewFeedItem item = new ReviewFeedItem(
                10L,
                "soma-1",
                "AI 제품 만들기",
                EventType.LECTURE,
                "정다은 멘토",
                "정말 좋았습니다",
                "김연수",
                true,
                Instant.parse("2026-05-22T01:00:00Z")
        );
        Page<ReviewFeedItem> mocked = new PageImpl<>(
                List.of(item),
                PageRequest.of(2, 5),
                21
        );
        when(reviewRepository.findFeed(any(), any(), any(), any(), any())).thenReturn(mocked);

        ReviewFeedPageResponse response = service.findFeed(VIEWER_USER_ID, "ai", null, null, 3, 5);

        assertThat(response.items()).containsExactly(item);
        assertThat(response.items().get(0).isAuthor()).isTrue();
        assertThat(response.page()).isEqualTo(3);
        assertThat(response.size()).isEqualTo(5);
        assertThat(response.totalElements()).isEqualTo(21);
        assertThat(response.totalPages()).isEqualTo(5);
    }
}
