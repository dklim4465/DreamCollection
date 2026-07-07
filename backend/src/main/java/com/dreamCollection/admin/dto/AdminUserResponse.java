package com.dreamCollection.admin.dto;

import com.dreamCollection.user.entity.User;

import java.time.LocalDateTime;

public record AdminUserResponse(
        Long id,
        String email,
        String name,
        String nickname,
        String phone,
        String role,
        String status,
        boolean emailVerified,
        boolean phoneVerified,
        LocalDateTime createdAt
) {
    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(), user.getEmail(), user.getName(), user.getNickname(), user.getPhone(),
                user.getRole().name(), user.getStatus().name(),
                user.isEmailVerified(), user.isPhoneVerified(), user.getCreatedAt()
        );
    }
}
