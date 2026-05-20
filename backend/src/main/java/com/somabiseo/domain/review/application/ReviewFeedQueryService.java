package com.somabiseo.domain.review.application;

import com.somabiseo.domain.review.domain.ReviewFeedItem;
import com.somabiseo.domain.review.infrastructure.ReviewRepository;
import com.somabiseo.domain.review.presentation.ReviewFeedPageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewFeedQueryService {
    private final ReviewRepository reviewRepository;

    public ReviewFeedQueryService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public ReviewFeedPageResponse findFeed(String q, String eventId, int page, int size) {
        String normalizedQ = normalize(q);
        String normalizedEventId = normalize(eventId);
        PageRequest pageable = PageRequest.of(Math.max(page - 1, 0), Math.max(size, 1));

        Page<ReviewFeedItem> result = reviewRepository.findFeed(normalizedQ, normalizedEventId, pageable);

        return new ReviewFeedPageResponse(
                result.getContent(),
                result.getNumber() + 1,
                result.getSize(),
                result.getTotalPages(),
                result.getTotalElements()
        );
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();

        return trimmed.isEmpty() ? null : trimmed;
    }
}
