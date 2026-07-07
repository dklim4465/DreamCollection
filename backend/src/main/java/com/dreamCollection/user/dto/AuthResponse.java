package com.dreamCollection.user.dto;

/**
 * 프론트 AuthRes 타입과 필드 매칭 (accessToken, user)
 * refreshToken은 추가된 필드 — 프론트 types/index.ts의 AuthRes에도
 * refreshToken?: string 필드를 추가해줘야 함
 */
public record AuthResponse(
        String accessToken,
        String refreshToken,
        UserResponse user
) {
}
