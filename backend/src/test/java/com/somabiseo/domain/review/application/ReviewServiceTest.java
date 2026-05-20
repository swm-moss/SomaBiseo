package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.Review;
import com.somabiseo.domain.review.domain.ReviewConflictException;
import com.somabiseo.domain.review.domain.ReviewException;
import com.somabiseo.domain.review.domain.ReviewForbiddenException;
import com.somabiseo.domain.review.domain.ReviewResponse;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.somaevent.domain.EventType;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import com.somabiseo.global.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.dao.DataIntegrityViolationException;

import java.lang.reflect.Field;
import java.time.Clock;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReviewServiceTest {
    private static final String EVENT_ID = "soma-lecture-20260520-ai-product";
    private static final Long SOMA_EVENT_ID = 42L;
    private static final Long AUTHOR_USER_ID = 7L;
    private static final OffsetDateTime NOW = OffsetDateTime.parse("2026-05-22T10:00:00+09:00");
    private static final OffsetDateTime END_AT = OffsetDateTime.parse("2026-05-20T17:00:00+09:00");

    private ReviewRepository reviewRepository;
    private SomaEventRepository somaEventRepository;
    private ReviewService service;

    @BeforeEach
    void setUp() {
        reviewRepository = mock(ReviewRepository.class);
        somaEventRepository = mock(SomaEventRepository.class);
        Clock clock = Clock.fixed(NOW.toInstant(), ZoneId.of("Asia/Seoul"));

        service = new ReviewService(reviewRepository, somaEventRepository, clock);
    }

    @Test
    void create_본문이_19자면_ReviewException() {
        stubEvent();

        assertThatThrownBy(() -> service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", "정말 좋은 강의였습니다이!", "1.1.1.1"))
                .isInstanceOf(ReviewException.class);
    }

    @Test
    void create_본문이_501자면_ReviewException() {
        stubEvent();
        String content = "가".repeat(501);

        assertThatThrownBy(() -> service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", content, "1.1.1.1"))
                .isInstanceOf(ReviewException.class);
    }

    @Test
    void create_종료후_3일이_지났어도_저장된다() {
        OffsetDateTime longAgo = OffsetDateTime.parse("2026-05-01T17:00:00+09:00");
        SomaEvent event = somaEventWith(longAgo);
        when(somaEventRepository.findBySourceId(EVENT_ID)).thenReturn(Optional.of(event));
        when(reviewRepository.existsBySomaEventIdAndAuthorUserId(SOMA_EVENT_ID, AUTHOR_USER_ID)).thenReturn(false);
        Review saved = Review.create(SOMA_EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");
        setField(saved, "id", 300L);
        setField(saved, "createdAt", Instant.parse("2026-05-22T01:00:00Z"));
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);

        ReviewResponse response = service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");

        assertThat(response.id()).isEqualTo(300L);
    }

    @Test
    void create_아직_종료_안된_이벤트면_ReviewForbiddenException() {
        OffsetDateTime later = OffsetDateTime.parse("2026-05-23T17:00:00+09:00");
        SomaEvent event = somaEventWith(later);
        when(somaEventRepository.findBySourceId(EVENT_ID)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1"))
                .isInstanceOf(ReviewForbiddenException.class)
                .hasMessageContaining("아직");
    }

    @Test
    void create_명단_검증_없이_freeform_이름으로_저장() {
        stubEvent();
        when(reviewRepository.existsBySomaEventIdAndAuthorUserId(SOMA_EVENT_ID, AUTHOR_USER_ID)).thenReturn(false);
        Review saved = Review.create(SOMA_EVENT_ID, AUTHOR_USER_ID, "낯선이름", validContent(), "1.1.1.1");
        setField(saved, "id", 200L);
        setField(saved, "createdAt", Instant.parse("2026-05-22T01:00:00Z"));
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);

        ReviewResponse response = service.create(EVENT_ID, AUTHOR_USER_ID, "낯선이름", validContent(), "1.1.1.1");

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertThat(captor.getValue().getAuthorName()).isEqualTo("낯선이름");
        assertThat(captor.getValue().getAuthorUserId()).isEqualTo(AUTHOR_USER_ID);
        assertThat(response.authorName()).isEqualTo("낯선이름");
        assertThat(response.id()).isEqualTo(200L);
    }

    @Test
    void create_이미_같은_user로_작성됐으면_ReviewConflictException() {
        stubEvent();
        when(reviewRepository.existsBySomaEventIdAndAuthorUserId(SOMA_EVENT_ID, AUTHOR_USER_ID)).thenReturn(true);

        assertThatThrownBy(() -> service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1"))
                .isInstanceOf(ReviewConflictException.class);
        verify(reviewRepository, never()).save(any());
    }

    @Test
    void create_DB_UNIQUE_위반이면_ReviewConflictException으로_변환() {
        stubEvent();
        when(reviewRepository.existsBySomaEventIdAndAuthorUserId(SOMA_EVENT_ID, AUTHOR_USER_ID)).thenReturn(false);
        when(reviewRepository.save(any(Review.class)))
                .thenThrow(new DataIntegrityViolationException("uk_review_event_user"));

        assertThatThrownBy(() -> service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1"))
                .isInstanceOf(ReviewConflictException.class);
    }

    @Test
    void create_이벤트가_없으면_NotFoundException() {
        when(somaEventRepository.findBySourceId(EVENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void create_정상_케이스는_저장하고_응답_반환() {
        stubEvent();
        when(reviewRepository.existsBySomaEventIdAndAuthorUserId(SOMA_EVENT_ID, AUTHOR_USER_ID)).thenReturn(false);
        Review saved = Review.create(SOMA_EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");
        setField(saved, "id", 100L);
        setField(saved, "createdAt", Instant.parse("2026-05-22T01:00:00Z"));
        when(reviewRepository.save(any(Review.class))).thenReturn(saved);

        ReviewResponse response = service.create(EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");

        ArgumentCaptor<Review> captor = ArgumentCaptor.forClass(Review.class);
        verify(reviewRepository).save(captor.capture());
        assertThat(captor.getValue().getAuthorName()).isEqualTo("김연수");
        assertThat(captor.getValue().getAuthorUserId()).isEqualTo(AUTHOR_USER_ID);
        assertThat(captor.getValue().getSomaEventId()).isEqualTo(SOMA_EVENT_ID);
        assertThat(response.eventId()).isEqualTo(EVENT_ID);
        assertThat(response.authorName()).isEqualTo("김연수");
        assertThat(response.id()).isEqualTo(100L);
    }

    @Test
    void update_본인_후기는_내용을_수정한다() {
        Review existing = Review.create(SOMA_EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");
        setField(existing, "id", 11L);
        when(reviewRepository.findById(11L)).thenReturn(Optional.of(existing));

        service.update(11L, AUTHOR_USER_ID, "수정된 후기 내용입니다. 정말 좋았어요.");

        assertThat(existing.getContent()).isEqualTo("수정된 후기 내용입니다. 정말 좋았어요.");
    }

    @Test
    void update_본인이_아니면_ReviewForbiddenException() {
        Review existing = Review.create(SOMA_EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");
        setField(existing, "id", 11L);
        when(reviewRepository.findById(11L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.update(11L, 999L, "남이 수정하려고 하는 내용입니다입니다"))
                .isInstanceOf(ReviewForbiddenException.class);
    }

    @Test
    void update_없는_후기면_NotFoundException() {
        when(reviewRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.update(404L, AUTHOR_USER_ID, validContent()))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void update_내용이_짧으면_ReviewException() {
        assertThatThrownBy(() -> service.update(11L, AUTHOR_USER_ID, "짧음"))
                .isInstanceOf(ReviewException.class);
        verify(reviewRepository, never()).findById(any());
    }

    @Test
    void delete_본인_후기는_삭제된다() {
        Review existing = Review.create(SOMA_EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");
        setField(existing, "id", 11L);
        when(reviewRepository.findById(11L)).thenReturn(Optional.of(existing));

        service.delete(11L, AUTHOR_USER_ID);

        verify(reviewRepository).delete(existing);
    }

    @Test
    void delete_본인이_아니면_ReviewForbiddenException() {
        Review existing = Review.create(SOMA_EVENT_ID, AUTHOR_USER_ID, "김연수", validContent(), "1.1.1.1");
        setField(existing, "id", 11L);
        when(reviewRepository.findById(11L)).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.delete(11L, 999L))
                .isInstanceOf(ReviewForbiddenException.class);
        verify(reviewRepository, never()).delete(any(Review.class));
    }

    @Test
    void delete_없는_후기면_NotFoundException() {
        when(reviewRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(404L, AUTHOR_USER_ID))
                .isInstanceOf(NotFoundException.class);
    }

    private void stubEvent() {
        SomaEvent event = somaEventWith(END_AT);
        when(somaEventRepository.findBySourceId(EVENT_ID)).thenReturn(Optional.of(event));
    }

    private SomaEvent somaEventWith(OffsetDateTime endAt) {
        try {
            java.lang.reflect.Constructor<SomaEvent> constructor = SomaEvent.class.getDeclaredConstructor();
            constructor.setAccessible(true);
            SomaEvent event = constructor.newInstance();
            setField(event, "id", SOMA_EVENT_ID);
            setField(event, "sourceId", EVENT_ID);
            setField(event, "type", EventType.LECTURE);
            setField(event, "title", "AI 제품을 실제 사용자에게 붙이는 법");
            setField(event, "mentorName", "정다은 멘토");
            setField(event, "endAt", endAt);
            setField(event, "sourceUrl", "https://swmaestro.org");

            return event;
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private String validContent() {
        return "정말 유익한 강의였습니다. 다음에도 또 듣고 싶어요.";
    }

    private static void setField(Object target, String name, Object value) {
        try {
            Field field = findField(target.getClass(), name);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception exception) {
            throw new IllegalStateException(exception);
        }
    }

    private static Field findField(Class<?> type, String name) throws NoSuchFieldException {
        Class<?> current = type;

        while (current != null) {
            try {
                return current.getDeclaredField(name);
            } catch (NoSuchFieldException ignored) {
                current = current.getSuperclass();
            }
        }

        throw new NoSuchFieldException(name);
    }
}
