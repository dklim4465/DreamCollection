package com.dreamCollection.verification.dto;

// 2단계 검증 성공 시 프론트에 내려주는 1회용 재설정 토큰 (3단계에서 그대로 다시 전달받음)
public record PasswordResetTokenResponse(
        String resetToken
) {
}
