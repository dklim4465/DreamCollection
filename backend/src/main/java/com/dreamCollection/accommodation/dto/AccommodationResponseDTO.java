package com.dreamCollection.accommodation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccommodationResponseDTO {

    private Long accommodationId;

    private String accommodationName;

    private String accommodationType;

    private String cityName;

    private String countryName;

    private String region;

    private String address;

    private BigDecimal price;

    private String currency;

    private BigDecimal rating;

    private String provider;

    private String externalUrl;

    private String imageUrl;
}