package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlanRequestDTO {

    private String who;
    // 시작일시
    private LocalDate startDate;
    private String when;
    private String region;
    private String theme;
    private String level;
    // 항공 관련 선택지
    private FlightConditionDTO flightCondition;
    private String destination;
    // 숙소 관련 선택지
    private AccommodationConditionDTO accommodationCondition;
}
