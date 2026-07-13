package com.dreamCollection.flight.api.serp;

import com.dreamCollection.flight.dto.FlightOfferDTO;
import com.dreamCollection.flight.dto.FlightSegmentDTO;
import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Component
public class SerpFlightOfferMapper {

    private static final DateTimeFormatter DATE_TIME_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // 항공 값(출발,복귀) 값을 둘다 받아서 우리가 쓸수 있게 DTO로 변환해주는 메서드
    public FlightOfferDTO toDTO(JsonNode outboundOffer, JsonNode returnOffer) {
        return FlightOfferDTO.builder()
                .outboundFlight(toSegment(outboundOffer))
                .returnFlight(toSegment(returnOffer))
                .price(BigDecimal.valueOf(outboundOffer.path("price").asLong(0)))
                .currency(SerpFlightConstants.CURRENCY)
                .provider(SerpFlightConstants.PROVIDER)
                .externalUrl(SerpFlightConstants.GOOGLE_FLIGHTS_URL)
                .build();
    }

    // 출발,복귀 편의 구조가 동일하기 때문에 한개의 메서드로 두개를 처리
    // 이것도 우리의 DTO로 변환하는 메서드
    private FlightSegmentDTO toSegment(JsonNode offer) {
        JsonNode flights = offer == null ? null : offer.path("flights");

        if (isEmptyFlights(flights)) {
            return null;
        }

        JsonNode firstFlight = flights.get(0);
        JsonNode lastFlight = flights.get(flights.size() - 1);

        JsonNode departureAirport = firstFlight.path("departure_airport");
        JsonNode arrivalAirport = lastFlight.path("arrival_airport");

        LocalDateTime departureTime = parse(departureAirport.path("time").asText(null));
        LocalDateTime arrivalTime = parse(arrivalAirport.path("time").asText(null));

        return FlightSegmentDTO.builder()
                .airlineName(firstFlight.path("airline").asText(null))
                .flightNumber(firstFlight.path("flight_number").asText(null))
                .departureAirportCode(departureAirport.path("id").asText(null))
                .departureAirportName(departureAirport.path("name").asText(null))
                .arrivalAirportCode(arrivalAirport.path("id").asText(null))
                .arrivalAirportName(arrivalAirport.path("name").asText(null))
                .departureDate(departureTime == null ? null : departureTime.toLocalDate())
                .arrivalDate(arrivalTime == null ? null : arrivalTime.toLocalDate())
                .departureTime(departureTime == null ? null : departureTime.toLocalTime())
                .arrivalTime(arrivalTime == null ? null : arrivalTime.toLocalTime())
                .durationMinutes(offer.path("total_duration").asInt(0))
                .build();
    }

    private boolean isEmptyFlights(JsonNode flights) {
        return flights == null || !flights.isArray() || flights.isEmpty();
    }

    // 시간을 받아오면 우리가 처리하기 편한 구조로 변경(타입 변경)
    private LocalDateTime parse(String value) {
        return value == null || value.isBlank()
                ? null
                : LocalDateTime.parse(value.replace("T", " "), DATE_TIME_FORMATTER);
    }
}