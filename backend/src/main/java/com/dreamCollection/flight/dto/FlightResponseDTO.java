package com.dreamCollection.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlightResponseDTO {

    private String airlineName;

    private String flightNumber;

    private String departureAirportCode;

    private String departureAirportName;

    private String arrivalAirportCode;

    private String arrivalAirportName;

    private LocalDate departureDate;

    private LocalDate arrivalDate;

    private LocalTime departureTime;

    private LocalTime arrivalTime;

    private Integer durationMinutes;

    private BigDecimal price;

    private String currency;

    private String provider;

    private String externalUrl;
}