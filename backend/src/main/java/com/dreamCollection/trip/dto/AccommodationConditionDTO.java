package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccommodationConditionDTO {

    private Boolean skip; // RECOMMEND, BOOKED, SKIP

    private String accommodationType; // HOTEL, RESORT, GUESTHOUSE

    private String priority; // PRICE, LOCATION, RATING

    private Integer maxPrice;
}
