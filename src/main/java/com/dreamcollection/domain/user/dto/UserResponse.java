package com.dreamcollection.domain.user.dto;

import com.dreamcollection.domain.user.TravelStyle;
import com.dreamcollection.domain.user.User;

import java.time.LocalDateTime;

/**
 * 프론트 types/index.ts 의 User 인터페이스와 필드 매칭
 * passwordHash, uuid 등 민감/내부 정보는 제외
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
