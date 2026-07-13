package com.dreamCollection.trip.ai;

import com.dreamCollection.trip.dto.PlanRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class TripPromptBuilder {

    public String build(PlanRequestDTO request) {
        return """
                아래 여행 조건에 맞는 여행 일정을 추천해줘.

                동행 유형: %s
                여행 기간: %s
                여행 지역: %s
                여행 테마: %s
                여행 강도: %s

                조건에 맞는 추천 일정을 날짜별로 구성할 수 있도록 준비해줘.
                """.formatted(
                request.getWho(),
                request.getWhen(),
                request.getRegion(),
                request.getTheme(),
                request.getLevel(),
                request.getFlightCondition(),
                request.getAccommodationCondition()
        );
    }
}