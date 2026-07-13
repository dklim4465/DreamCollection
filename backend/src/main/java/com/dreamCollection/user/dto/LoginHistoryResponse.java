package com.dreamCollection.user.dto;

import com.dreamCollection.user.entity.LoginHistory;

import java.time.LocalDateTime;

public record LoginHistoryResponse(
        Long id,
        String loginType,
        String ipAddress,
        String userAgent,
        boolean success,
        LocalDateTime createdAt
) {
    public static LoginHistoryResponse from(LoginHistory history) {
        return new LoginHistoryResponse(
                history.getId(),
                history.getLoginType().name(),
                history.getIpAddress(),
                history.getUserAgent(),
                history.isSuccess(),
                history.getCreatedAt()
        );
    }
}
