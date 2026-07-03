package com.dreamcollection.domain.user.dto;

import jakarta.validation.constraints.NotBlank;

public record RefreshTokenRequest(
        @NotBlank(message = "refreshToken이 필요합니다")
        String refreshToken
) {
}
