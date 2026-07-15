package com.dreamCollection.flight.api.serp;

import com.dreamCollection.trip.dto.FlightConditionDTO;
import org.springframework.stereotype.Component;

@Component
public class SerpTravelClassMapper {

    public String map(FlightConditionDTO flightCondition) {
        if (flightCondition == null || flightCondition.getSeatClass() == null) {
            return "1";
        }

        return switch (flightCondition.getSeatClass()) {
            case "PREMIUM_ECONOMY" -> "2";
            case "BUSINESS" -> "3";
            case "FIRST" -> "4";
            default -> "1";
        };
    }
}