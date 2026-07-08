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
public class AirportOptionDTO {

    private Long airportId;

    private String airportCode;

    private String airportName;

    private String cityName;

    private String countryName;

    private String region;

    private BigDecimal latitude;

    private BigDecimal longitude;
}