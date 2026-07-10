package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FlightConditionDTO {

    private Boolean skip;

    private String priority; // PRICE, TIME, DIRECT

    private String seatClass; // ECONOMY, BUSINESS

    private Boolean directOnly;

    private String preferredDepartureTime; // MORNING, AFTERNOON, EVENING

}
