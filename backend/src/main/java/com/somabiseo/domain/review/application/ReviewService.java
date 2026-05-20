package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.Review;
import com.somabiseo.domain.review.domain.ReviewConflictException;
import com.somabiseo.domain.review.domain.ReviewException;
import com.somabiseo.domain.review.domain.ReviewForbiddenException;
import com.somabiseo.domain.review.domain.ReviewResponse;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.somaevent.domain.SomaEvent;
import com.somabiseo.domain.somaevent.infrastructure.SomaEventRepository;
import com.somabiseo.global.exception.NotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.time.ZoneId;

@Service
public class ReviewService {
    static final int MIN_CONTENT_LENGTH = 20;
    static final int MAX_CONTENT_LENGTH = 500;

    private final ReviewRepository reviewRepository;
    private final SomaEventRepository somaEventRepository;
    private final Clock clock;

    public ReviewService(
            ReviewRepository reviewRepository,
            SomaEventRepository somaEventRepository,
            Clock clock
    ) {
        this.reviewRepository = reviewRepository;
        this.somaEventRepository = somaEventRepository;
        this.clock = clock;
    }

    @Transactional
    public ReviewResponse create(String eventId, String authorName, String content, String authorIp) {
        validateContent(content);

        String trimmedAuthor = trimAuthor(authorName);
        SomaEvent event = requireEvent(eventId);
        OffsetDateTime now = OffsetDateTime.now(clock.withZone(ZoneId.of("Asia/Seoul")));

        validateWindow(event, now);

        if (reviewRepository.existsBySomaEventIdAndAuthorName(event.getId(), trimmedAuthor)) {
            throw new ReviewConflictException("이미 후기를 작성하셨어요.");
        }

        Review review = Review.create(event.getId(), trimmedAuthor, content.trim(), authorIp);

        try {
            Review saved = reviewRepository.save(review);

            return toResponse(saved, eventId);
        } catch (DataIntegrityViolationException exception) {
            throw new ReviewConflictException("이미 후기를 작성하셨어요.");
        }
    }

    private void validateContent(String content) {
        if (content == null) {
            throw new ReviewException("후기 내용을 입력해 주세요.");
        }

        String trimmed = content.trim();
        int length = trimmed.length();

        if (length < MIN_CONTENT_LENGTH || length > MAX_CONTENT_LENGTH) {
            throw new ReviewException("후기 내용은 " + MIN_CONTENT_LENGTH + "자 이상 " + MAX_CONTENT_LENGTH + "자 이하여야 해요.");
        }
    }

    private String trimAuthor(String authorName) {
        if (authorName == null) {
            throw new ReviewException("작성자 이름이 필요해요.");
        }

        String trimmed = authorName.trim();

        if (trimmed.isEmpty()) {
            throw new ReviewException("작성자 이름이 필요해요.");
        }

        return trimmed;
    }

    private SomaEvent requireEvent(String eventId) {
        return somaEventRepository.findBySourceId(eventId)
                .orElseThrow(() -> new NotFoundException("해당 강의를 찾을 수 없어요."));
    }

    private void validateWindow(SomaEvent event, OffsetDateTime now) {
        OffsetDateTime endAt = event.getEndAt();

        if (endAt == null) {
            throw new ReviewForbiddenException("종료 시각이 확정되지 않은 강의예요.");
        }

        if (now.isBefore(endAt)) {
            throw new ReviewForbiddenException("아직 종료되지 않은 강의예요.");
        }
    }

    private ReviewResponse toResponse(Review review, String eventId) {
        return new ReviewResponse(
                review.getId(),
                eventId,
                review.getAuthorName(),
                review.getContent(),
                review.getCreatedAt()
        );
    }
}
