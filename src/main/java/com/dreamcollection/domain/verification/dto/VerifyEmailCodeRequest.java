package com.dreamcollection.domain.verification.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailCodeRequest(
        @NotBlank(message = "이메일을 입력해주세요")
        String email,

        @NotBlank(message = "인증번호를 입력해주세요")
        String code
) {
}
