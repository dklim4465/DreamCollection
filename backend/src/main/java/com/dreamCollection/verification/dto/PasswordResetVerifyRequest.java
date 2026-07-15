package com.dreamCollection.verification.dto;

import jakarta.validation.constraints.NotBlank;

// 비밀번호 찾기 2단계: 발송된 인증코드 검증 → 성공 시 1회용 resetToken 발급
public record PasswordResetVerifyRequest(
        @NotBlank(message = "이메일을 입력해주세요")
        String email,

        @NotBlank(message = "인증번호를 입력해주세요")
        String code
) {
}
