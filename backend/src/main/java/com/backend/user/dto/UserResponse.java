package com.backend.user.dto;

import com.backend.user.TravelStyle;
import com.backend.user.User;

import java.time.LocalDateTime;

/**
 * ?ÑÎ°†??types/index.ts ??User ?∏ÌÑ∞?òÏù¥?§Ï? ?ÑÎìú Îß§Ïπ≠
 * passwordHash, uuid ??ÎØºÍ∞ê/?¥Î? ?ïÎ≥¥???úÏô∏
 */
public record UserResponse(
        Long id,
        String email,
        String name,
        String nickname,
        String phone,
        String profileImage,
        TravelStyle travelStyle,
        LocalDateTime createdAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getTravelStyle(),
                user.getCreatedAt()
        );
    }
}
