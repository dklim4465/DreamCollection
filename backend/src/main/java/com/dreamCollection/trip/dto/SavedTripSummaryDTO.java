package com.dreamCollection.trip.dto;

import java.time.LocalDateTime;

/**
 * 홈페이지 "내가 저장한 여행" 미리보기 / 내 일정 목록에서 사용하는 저장된 여행 요약.
 * saved_trips의 conditions_json(지역/테마)과 recommendation_json(제목)에서 필요한 값만 뽑아서 내려준다.
 */
public record SavedTripSummaryDTO(
        Long id,
        String title,
        String region,
        String theme,
        LocalDateTime createdDate
) {
}
