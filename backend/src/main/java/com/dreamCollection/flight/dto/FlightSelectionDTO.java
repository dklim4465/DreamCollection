package com.dreamCollection.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlightSelectionDTO {

    private boolean skipped;

    private FlightSegmentDTO outboundFlight;

    private FlightSegmentDTO returnFlight;

    private BigDecimal price;

    private String currency;

    private String provider;

    private String externalUrl;
}