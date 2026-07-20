package com.dreamCollection.stats.dto;

/**
 * 홈 화면 "함께 쌓아온 여행의 기록" 섹션용 실제 집계 응답.
 */
public record StatsResponse(
        long tripCount,        // 등록된 여행 일정 (saved_trips)
        long userCount,        // 함께한 여행자 (users)
        long travelLogCount,   // 작성된 여행일지 (travel_log)
        long countryCount,     // 여행 가능한 국가 수 (badge 도감의 COUNTRY_VISIT 뱃지 개수 기준)
        long badgeEarnedCount  // 지금까지 지급된 뱃지 수 (user_badge) — "이 앱을 쓰는 모든 사람" 관점의 활동 지표
) {
}
