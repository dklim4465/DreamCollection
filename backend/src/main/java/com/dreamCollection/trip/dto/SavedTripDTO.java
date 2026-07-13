package com.dreamCollection.trip.dto;

import com.dreamCollection.accommodation.dto.AccommodationSelectionDTO;
import com.dreamCollection.flight.dto.FlightSelectionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
// 저장한 일정 조회용
public class SavedTripDTO {

    private Long savedTripId;

    private Long userId;

    private PlanRequestDTO conditions;

    private TripRecommendDTO recommendation;

    private FlightSelectionDTO flightSelection;

    private AccommodationSelectionDTO accommodationSelection;

    private LocalDateTime createdDate;
}
