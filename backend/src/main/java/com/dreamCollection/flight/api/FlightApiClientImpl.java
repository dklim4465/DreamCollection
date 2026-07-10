package com.dreamCollection.flight.api;

import com.dreamCollection.flight.api.serp.SerpFlightApiCaller;
import com.dreamCollection.flight.api.serp.SerpFlightOfferMapper;
import com.dreamCollection.flight.api.serp.SerpFlightQueryBuilder;
import com.dreamCollection.flight.dto.FlightOfferDTO;
import com.dreamCollection.flight.dto.FlightRequestDTO;
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

    private final FlightRepository flightRepository;
    private final SerpFlightApiCaller apiCaller;
    private final SerpFlightQueryBuilder queryBuilder;
    private final SerpFlightOfferMapper offerMapper;


    // 국가, 도시 받아와서 공항 목록 조회해서 항공 검색을 실행하고, 그결과를 리스트로
    @Override
    public List<FlightOfferDTO> searchFlights(FlightRequestDTO requestDTO) {
        return flightRepository.findByRegionAndCityNameOrderByDisplayOrderAsc(requestDTO.getRegion(),requestDTO.getDestination())
                .stream()
                .flatMap(airport -> searchByAirport(requestDTO, airport).stream())
                .toList();
    }

    // 공항값 하나 받아와서 우리가 쓸 FlightOfferDTO 타입으로 변환하고 리스트로 담기
    private List<FlightOfferDTO> searchByAirport(FlightRequestDTO requestDTO, Airport airport) {
        JsonNode response = apiCaller.call(queryBuilder.build(requestDTO, airport.getAirportCode(), null));

        return collectOffers(response)
                .stream()
                .limit(OFFERS_PER_AIRPORT)
                .map(outboundOffer -> offerMapper.toDTO(
                        outboundOffer,
                        findReturnOffer(requestDTO, airport, outboundOffer)
                ))
                .toList();
    }


    // GoogleApi인 serp에서는 가는편을 조회를 하면 오는편을 조회할 수 있는 토큰을 하나 준다
    // 그래서 그걸 통해서 토큰과 함께 조회를 한다
    private JsonNode findReturnOffer(FlightRequestDTO requestDTO, Airport airport, JsonNode outboundOffer) {

        // 토큰 값 저장하고
        String departureToken = outboundOffer.path("departure_token").asText(null);

        // 토큰 값이 없다면 가는편도 조회를 안했다는 뜻이 된다(혹은 문제 발생)
        if (departureToken == null || departureToken.isBlank()) {
            return null;
        }

        // 그 토큰 값 포함해서 요청하기
        JsonNode response = apiCaller.call(
                queryBuilder.build(requestDTO, airport.getAirportCode(), departureToken)
        );

        return collectOffers(response).stream()
                .findFirst()
                .orElse(null);
    }



    // serpApi에서 항공 후보 배열을 다 꺼내서 하나의 리스트로 합치는 과정
    private List<JsonNode> collectOffers(JsonNode response) {
        List<JsonNode> offers = new ArrayList<>();

        // 원래 응답은 후보를 두군데로 나눠서 주지만 우리는 합쳐서 사용함
        if (response != null) {
            response.path("best_flights").forEach(offers::add);
            response.path("other_flights").forEach(offers::add);
        }

        return offers;
    }
}