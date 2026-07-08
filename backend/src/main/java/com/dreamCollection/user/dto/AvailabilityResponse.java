package com.dreamCollection.user.dto;

/**
 * 회원가입창 이메일/휴대폰 "중복확인" 응답
 * available = true  → 사용 가능(중복 아님)
 * available = false → 이미 가입되어 있음
 */
public record AvailabilityResponse(boolean available) {
    public static AvailabilityResponse of(boolean available) {
        return new AvailabilityResponse(available);
    }
}
