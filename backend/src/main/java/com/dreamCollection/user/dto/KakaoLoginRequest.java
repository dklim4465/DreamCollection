package com.dreamCollection.user.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 카카오 로그인 요청
 * 프론트가 카카오 인가 코드(authorization code)를 받아서 그대로 넘겨줌
 */
public record KakaoLoginRequest(
        @NotBlank(message = "인가 코드가 필요합니다")
        String code
) {
}