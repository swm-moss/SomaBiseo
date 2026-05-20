package com.somabiseo.domain.review.presentation;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewCreateRequest(
        @NotBlank String authorName,
        @NotBlank
        @Size(min = 20, max = 500, message = "후기 내용은 20자 이상 500자 이하여야 해요.")
        String content,
        boolean attended
) {
    @AssertTrue(message = "이 강의를 직접 들었음을 확인해 주세요.")
    public boolean isAttendedConfirmed() {
        return attended;
    }
}
