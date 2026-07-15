package com.dreamCollection.flight.api.serp;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightReturnRequestDTO;
import com.dreamCollection.trip.dto.FlightConditionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
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
        return buildCommonParams(
                requestDTO.getStartDate(),
                requestDTO.getWhen(),
                requestDTO.getFlightCondition(),
                arrivalAirportCode,
                departureToken
        );
    }

    public Map<String, String> build(FlightReturnRequestDTO requestDTO) {
        return buildCommonParams(
                requestDTO.getStartDate(),
                requestDTO.getWhen(),
                requestDTO.getFlightCondition(),
                requestDTO.getArrivalAirportCode(),
                requestDTO.getDepartureToken()
        );
    }

    private Map<String, String> buildCommonParams(
            LocalDate startDate,
            String when,
            FlightConditionDTO flightCondition,
            String arrivalAirportCode,
            String departureToken
    ) {
        Map<String, String> queryParams = new LinkedHashMap<>();

        String[][] params = {
                {"engine", SerpFlightConstants.ENGINE},
                {"departure_id", SerpFlightConstants.DEPARTURE_AIRPORT_CODE},
                {"arrival_id", arrivalAirportCode},
                {"outbound_date", startDate.toString()},
                {"return_date", dateCalculator.calculateReturnDate(startDate, when).toString()},
                {"currency", SerpFlightConstants.CURRENCY},
                {"hl", SerpFlightConstants.LANGUAGE},
                {"gl", SerpFlightConstants.COUNTRY},
                {"type", SerpFlightConstants.ROUND_TRIP_TYPE},
                {"travel_class", travelClassMapper.map(flightCondition)}
        };

        Arrays.stream(params).forEach(param -> queryParams.put(param[0], param[1]));

        if (departureToken != null && !departureToken.isBlank()) {
            queryParams.put("departure_token", departureToken);
        }

        return queryParams;
    }
}