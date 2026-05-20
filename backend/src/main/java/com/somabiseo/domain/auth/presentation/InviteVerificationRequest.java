package com.somabiseo.domain.auth.presentation;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record InviteVerificationRequest(
        @NotBlank
        @Pattern(regexp = "\\d{6}", message = "초대 코드는 숫자 6자리여야 합니다.")
        String code
) {
}
