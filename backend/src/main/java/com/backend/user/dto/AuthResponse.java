package com.backend.user.dto;

/**
 * ?„ë¡ ??AuthRes ?€?…ê³¼ ?„ë“œ ë§¤ì¹­ (accessToken, user)
 */
public record AuthResponse(
        String accessToken,
        UserResponse user
) {
}
