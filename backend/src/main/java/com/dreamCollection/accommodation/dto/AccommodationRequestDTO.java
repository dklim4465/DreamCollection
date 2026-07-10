package com.dreamCollection.accommodation.dto;

import com.dreamCollection.trip.dto.AccommodationConditionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccommodationRequestDTO {

    private String region;

    private String destination;

    private LocalDate startDate;

    private String when;

    private AccommodationConditionDTO accommodationCondition;
}