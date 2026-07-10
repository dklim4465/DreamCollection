package com.dreamCollection.accommodation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccommodationSelectionDTO {

    private boolean skipped;

    private Long accommodationId;

    private String accommodationName;

    private String accommodationType;

    private LocalDate checkInDate;

    private LocalDate checkOutDate;

    private String address;

    private BigDecimal price;

    private String currency;

    private BigDecimal rating;

    private String provider;

    private String externalUrl;

    private String imageUrl;
}