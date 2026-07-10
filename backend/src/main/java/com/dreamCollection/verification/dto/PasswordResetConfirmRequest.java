package com.dreamCollection.verification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

// 비밀번호 찾기 3단계: 2단계에서 받은 resetToken + 새 비밀번호로 최종 변경
public record PasswordResetConfirmRequest(
        @NotBlank(message = "재설정 토큰이 없습니다")
        String resetToken,

        @NotBlank(message = "새 비밀번호를 입력해주세요")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
        String newPassword
) {
}
