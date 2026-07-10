package com.dreamCollection.user.dto;

import com.dreamCollection.user.entity.TravelStyle;

/**
 * 마이페이지 "프로필 수정"에서 사용. 전부 선택 입력 — 값이 있는 필드만 갱신.
 * 프론트: profileApi.updateMe() → PATCH /api/users/me
 */
public record UpdateProfileRequest(
        String nickname,
        String profileImageUrl,
        TravelStyle travelStyle
) {
}
