package com.dreamCollection.user.dto;

import com.dreamCollection.user.entity.RefreshToken;

import java.time.LocalDateTime;

public record DeviceSessionResponse(
        Long id,
        String userAgent,
        String ipAddress,
        LocalDateTime createdAt,
        LocalDateTime expiresAt
) {
    public static DeviceSessionResponse from(RefreshToken refreshToken) {
        return new DeviceSessionResponse(
                refreshToken.getId(),
                refreshToken.getUserAgent(),
                refreshToken.getIpAddress(),
                refreshToken.getCreatedAt(),
                refreshToken.getExpiresAt()
        );
    }
}
