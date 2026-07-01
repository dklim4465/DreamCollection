package com.dreamcollection.domain.user.dto;

/**
 * 프론트 AuthRes 타입과 필드 매칭 (accessToken, user)
 */
public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
