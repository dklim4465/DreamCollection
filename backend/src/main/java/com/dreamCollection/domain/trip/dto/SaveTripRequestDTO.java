package com.dreamcollection.domain.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SaveTripRequestDTO {
    //사용자 id값
    private Long userId;

    //선택한 조건을 담기(이후에 사용자의 여행 성향 분석에 쓸수 있음)
    private PlanRequestDTO conditions;

    private TripRecommendDTO recommendation;
}
