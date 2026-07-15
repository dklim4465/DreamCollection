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

    public FlightOfferDTO toOutboundDTO(JsonNode outboundOffer, String arrivalAirportCode) {
        return FlightOfferDTO.builder()
                .outboundFlight(toSegment(outboundOffer))
                .returnFlight(null)
                .price(BigDecimal.valueOf(outboundOffer.path("price").asLong(0)))
                .currency(SerpFlightConstants.CURRENCY)
                .provider(SerpFlightConstants.PROVIDER)
                .externalUrl(SerpFlightConstants.GOOGLE_FLIGHTS_URL)
                .departureToken(outboundOffer.path("departure_token").asText(null))
                .arrivalAirportCode(arrivalAirportCode)
                .priceType("ESTIMATED_ROUND_TRIP")
                .build();
    }

    public FlightOfferDTO toReturnDTO(JsonNode returnOffer) {
        return FlightOfferDTO.builder()
                .outboundFlight(null)
                .returnFlight(toSegment(returnOffer))
                .price(BigDecimal.valueOf(returnOffer.path("price").asLong(0)))
                .currency(SerpFlightConstants.CURRENCY)
                .provider(SerpFlightConstants.PROVIDER)
                .externalUrl(SerpFlightConstants.GOOGLE_FLIGHTS_URL)
                .priceType("FINAL_ROUND_TRIP")
                .build();
    }

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

    private LocalDateTime parse(String value) {
        return value == null || value.isBlank()
                ? null
                : LocalDateTime.parse(value.replace("T", " "), DATE_TIME_FORMATTER);
    }
}