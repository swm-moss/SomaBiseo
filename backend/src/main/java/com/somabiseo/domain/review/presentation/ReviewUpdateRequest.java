package com.somabiseo.domain.review.presentation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ReviewUpdateRequest(
        @NotBlank
        @Size(min = 20, max = 500, message = "후기 내용은 20자 이상 500자 이하여야 해요.")
        String content
) {
}
