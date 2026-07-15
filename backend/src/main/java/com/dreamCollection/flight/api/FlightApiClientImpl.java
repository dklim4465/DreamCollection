package com.dreamCollection.flight.api;

import com.dreamCollection.flight.api.serp.SerpFlightApiCaller;
import com.dreamCollection.flight.api.serp.SerpFlightOfferMapper;
import com.dreamCollection.flight.api.serp.SerpFlightQueryBuilder;
import com.dreamCollection.flight.dto.FlightOfferDTO;
import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightReturnRequestDTO;
import com.dreamCollection.flight.entity.Airport;
import com.dreamCollection.flight.repository.FlightRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Primary
@Component
@RequiredArgsConstructor
public class FlightApiClientImpl implements FlightApiClient {

    private static final int OFFERS_PER_AIRPORT = 3;
    private static final int RETURN_OFFERS_LIMIT = 10;

    private final FlightRepository flightRepository;
    private final SerpFlightApiCaller apiCaller;
    private final SerpFlightQueryBuilder queryBuilder;
    private final SerpFlightOfferMapper offerMapper;

    @Override
    public List<FlightOfferDTO> searchOutboundFlights(FlightRequestDTO requestDTO) {
        return flightRepository.findByRegionAndCityNameOrderByDisplayOrderAsc(
                        requestDTO.getRegion(),
                        requestDTO.getDestination()
                )
                .stream()
                .flatMap(airport -> searchOutboundByAirport(requestDTO, airport).stream())
                .toList();
    }

    @Override
    public List<FlightOfferDTO> searchReturnFlights(FlightReturnRequestDTO requestDTO) {
        JsonNode response = apiCaller.call(
                queryBuilder.build(requestDTO)
        );

        return collectOffers(response)
                .stream()
                .limit(RETURN_OFFERS_LIMIT)
                .map(offerMapper::toReturnDTO)
                .toList();
    }

    private List<FlightOfferDTO> searchOutboundByAirport(FlightRequestDTO requestDTO, Airport airport) {
        JsonNode response = apiCaller.call(
                queryBuilder.build(requestDTO, airport.getAirportCode(), null)
        );

        return collectOffers(response)
                .stream()
                .filter(this::hasDepartureToken)
                .limit(OFFERS_PER_AIRPORT)
                .map(outboundOffer -> offerMapper.toOutboundDTO(
                        outboundOffer,
                        airport.getAirportCode()
                ))
                .toList();
    }

    private List<JsonNode> collectOffers(JsonNode response) {
        List<JsonNode> offers = new ArrayList<>();

        if (response != null) {
            response.path("best_flights").forEach(offers::add);
            response.path("other_flights").forEach(offers::add);
        }

        return offers;
    }

    private boolean hasDepartureToken(JsonNode offer) {
        String departureToken = offer.path("departure_token").asText(null);
        return departureToken != null && !departureToken.isBlank();
    }
}