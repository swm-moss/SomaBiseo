package com.somabiseo.global.exception;

import com.somabiseo.global.response.ApiResponse;
import com.somabiseo.domain.eventsummary.domain.EventAiSummaryException;
import com.somabiseo.domain.calendar.domain.GoogleCalendarConnectionException;
import com.somabiseo.domain.portal.domain.SomaPortalException;
import com.somabiseo.domain.portal.domain.SomaPortalUnauthorizedException;
import com.somabiseo.domain.review.domain.ReviewConflictException;
import com.somabiseo.domain.review.domain.ReviewException;
import com.somabiseo.domain.review.domain.ReviewForbiddenException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(NotFoundException.class)
    ResponseEntity<ApiResponse<Void>> handleNotFound(NotFoundException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiResponse<Void>> handleValidation(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .orElse("요청 값을 확인해 주세요.");

        return ResponseEntity.badRequest().body(ApiResponse.error(message));
    }

    @ExceptionHandler(SomaPortalUnauthorizedException.class)
    ResponseEntity<ApiResponse<Void>> handlePortalUnauthorized(SomaPortalUnauthorizedException exception) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(SomaPortalException.class)
    ResponseEntity<ApiResponse<Void>> handlePortalException(SomaPortalException exception) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(EventAiSummaryException.class)
    ResponseEntity<ApiResponse<Void>> handleEventAiSummaryException(EventAiSummaryException exception) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(GoogleCalendarConnectionException.class)
    ResponseEntity<ApiResponse<Void>> handleGoogleCalendarConnectionException(
            GoogleCalendarConnectionException exception
    ) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(ReviewException.class)
    ResponseEntity<ApiResponse<Void>> handleReviewException(ReviewException exception) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(ReviewForbiddenException.class)
    ResponseEntity<ApiResponse<Void>> handleReviewForbiddenException(ReviewForbiddenException exception) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(ReviewConflictException.class)
    ResponseEntity<ApiResponse<Void>> handleReviewConflictException(ReviewConflictException exception) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(exception.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiResponse<Void>> handleException(Exception exception) {
        log.error("Unhandled server exception", exception);

        return ResponseEntity.internalServerError()
                .body(ApiResponse.error("서버에서 처리하지 못한 오류가 발생했습니다."));
    }
}
