package com.dreamCollection.badge.dto;

import com.dreamCollection.badge.entity.Badge;

/**
 * 마이페이지 "뱃지 목록"에서 사용.
 * earned=false인 뱃지는 "아직 획득 못한 뱃지"로 회색 처리해서 보여주는 용도.
 */
public record BadgeResponse(
        Long id,
        String code,
        String name,
        String description,
        String iconUrl,
        String conditionType,
        Integer conditionValue,
        String conditionCountryCode,
        boolean earned,
        boolean representative
) {
    public static BadgeResponse of(Badge badge, boolean earned, boolean representative) {
        return new BadgeResponse(
                badge.getId(),
                badge.getCode(),
                badge.getName(),
                badge.getDescription(),
                badge.getIconUrl(),
                badge.getConditionType(),
                badge.getConditionValue(),
                badge.getConditionCountryCode(),
                earned,
                representative
        );
    }
}
