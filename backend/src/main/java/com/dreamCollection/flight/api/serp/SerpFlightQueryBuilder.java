package com.dreamCollection.flight.api.serp;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class SerpFlightQueryBuilder {

    private final SerpFlightDateCalculator dateCalculator;
    private final SerpTravelClassMapper travelClassMapper;

    public Map<String, String> build(
            FlightRequestDTO requestDTO,
            String arrivalAirportCode,
            String departureToken
    ) {
        Map<String, String> queryParams = new LinkedHashMap<>();

        String[][] params = {
                {"engine", SerpFlightConstants.ENGINE},
                {"departure_id", SerpFlightConstants.DEPARTURE_AIRPORT_CODE},
                {"arrival_id", arrivalAirportCode},
                {"outbound_date", requestDTO.getStartDate().toString()},
                {"return_date", dateCalculator.calculateReturnDate(requestDTO).toString()},
                {"currency", SerpFlightConstants.CURRENCY},
                {"hl", SerpFlightConstants.LANGUAGE},
                {"gl", SerpFlightConstants.COUNTRY},
                {"type", SerpFlightConstants.ROUND_TRIP_TYPE},
                {"travel_class", travelClassMapper.map(requestDTO)}
        };

        Arrays.stream(params).forEach(param -> queryParams.put(param[0], param[1]));

        if (departureToken != null && !departureToken.isBlank()) {
            queryParams.put("departure_token", departureToken);
        }

        return queryParams;
    }
}