package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlanResponseDTO {

    private String who;
    private String when;
    private String region;
    private String theme;
    private String level;

    private LocalDate startDate;

    private FlightConditionDTO flightCondition;
    private String destination;

    private AccommodationConditionDTO accommodationCondition;

    private String prompt;
    private String aiResult;

    private List<TripRecommendDTO> recommendations;

}
