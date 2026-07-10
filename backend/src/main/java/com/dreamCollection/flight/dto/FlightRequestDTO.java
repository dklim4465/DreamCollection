package com.dreamCollection.flight.dto;

import com.dreamCollection.trip.dto.FlightConditionDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlightRequestDTO {

    private String region;

    private String destination;

    private LocalDate startDate;

    private String when;

    private FlightConditionDTO flightCondition;
}