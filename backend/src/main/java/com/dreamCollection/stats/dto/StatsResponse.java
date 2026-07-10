package com.dreamCollection.stats.dto;

/**
 * 홈 화면 "숫자로 보는 Dream Collection" 섹션용 실제 집계 응답.
 */
public record StatsResponse(
        long tripCount,       // 등록된 여행 일정 (saved_trips)
        long userCount,       // 함께한 여행자 (users)
        long travelLogCount,  // 작성된 여행일지 (travel_log)
        long countryCount     // 여행 가능한 국가 수 (city, distinct country_code)
) {
}
