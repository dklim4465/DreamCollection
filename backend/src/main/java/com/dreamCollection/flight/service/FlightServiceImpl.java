package com.dreamCollection.flight.service;

import com.dreamCollection.flight.api.FlightApiClient;
import com.dreamCollection.flight.dto.FlightOfferDTO;
import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.exception.FlightValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Log4j2
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightApiClient flightApiClient;
    private final FlightValidator flightValidator;

    @Override
    public List<FlightOfferDTO> searchFlights(FlightRequestDTO requestDTO) {
        flightValidator.validateSearch(requestDTO);
        return flightApiClient.searchFlights(requestDTO);
    }
}