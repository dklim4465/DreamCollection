package com.dreamCollection.flight.service;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightResponseDTO;
import com.dreamCollection.flight.entity.Airport;
import com.dreamCollection.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Service
@Log4j2
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService{

    // 나중에 인천 말고도 받을수 있게 수정 예정
    private static final String DEFAULT_DEPARTURE_AIRPORT_CODE = "ICN";
    private static final String DEFAULT_DEPARTURE_AIRPORT_NAME = "인천국제공항";

    private final FlightRepository flightRepository;

    @Override
    public List<FlightResponseDTO> searchFlights(FlightRequestDTO requestDTO){
        return flightRepository.findByRegionOrderByDisplayOrderAsc(requestDTO.getRegion())
                .stream()
                .map(aiport -> buildTemporaryFlight(requestDTO, aiport))
                .toList();
    }

    private FlightResponseDTO buildTemporaryFlight(FlightRequestDTO requestDTO, Airport airport) {
        return FlightResponseDTO.builder()
                .airlineName("임시항공")
                .flightNumber("TMP-" + airport.getAirportCode())
                .departureAirportCode(DEFAULT_DEPARTURE_AIRPORT_CODE)
                .departureAirportName(DEFAULT_DEPARTURE_AIRPORT_NAME)
                .arrivalAirportCode(airport.getAirportCode())
                .arrivalAirportName(airport.getAirportName())
                .departureDate(requestDTO.getStartDate())
                .arrivalDate(requestDTO.getStartDate())
                .departureTime(LocalTime.of(10, 0))
                .arrivalTime(LocalTime.of(12, 30))
                .durationMinutes(150)
                .price(BigDecimal.valueOf(300000))
                .currency("KRW")
                .provider("TEMP")
                .externalUrl("https://example.com/flights/" + airport.getAirportCode())
                .build();
    }

}
