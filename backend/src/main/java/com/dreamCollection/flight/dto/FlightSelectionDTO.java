package com.dreamCollection.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlightSelectionDTO {

    private boolean skipped;

    private Long airportId;

    private String airportCode;

    private String airportName;
}
