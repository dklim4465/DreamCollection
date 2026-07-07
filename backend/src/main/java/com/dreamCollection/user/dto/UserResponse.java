package com.dreamCollection.user.dto;

import com.dreamCollection.badge.entity.Badge;
import com.dreamCollection.user.entity.TravelStyle;
import com.dreamCollection.user.entity.User;

import java.time.LocalDateTime;

/**
 * 프론트 types/index.ts 의 User 인터페이스와 필드 매칭
 * passwordHash, uuid 등 민감/내부 정보는 제외
 *
 * badgeCode/badgeName/badgeIconUrl: 대표 뱃지(user_badge.is_representative=1)가 있을 때만 채워짐,
 * 없으면 전부 null → 프론트에서 닉네임 옆에 뱃지 아이콘을 조건부로 노출하는 데 사용.
 */
public record UserResponse(
        Long id,
        String email,
        String name,
        String nickname,
        String phone,
        String profileImage,
        TravelStyle travelStyle,
        String role,
        LocalDateTime createdAt,
        String badgeCode,
        String badgeName,
        String badgeIconUrl
) {
    public static UserResponse from(User user) {
        return from(user, null);
    }

    public static UserResponse from(User user, Badge representativeBadge) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getPhone(),
                user.getProfileImageUrl(),
                user.getTravelStyle(),
                user.getRole().name(),
                user.getCreatedAt(),
                representativeBadge != null ? representativeBadge.getCode() : null,
                representativeBadge != null ? representativeBadge.getName() : null,
                representativeBadge != null ? representativeBadge.getIconUrl() : null
        );
    }
}
