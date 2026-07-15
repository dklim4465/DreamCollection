package com.dreamCollection.flight.service;

import com.dreamCollection.flight.api.FlightApiClient;
import com.dreamCollection.flight.dto.FlightOfferDTO;
import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightReturnRequestDTO;
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
    public List<FlightOfferDTO> searchOutboundFlights(FlightRequestDTO requestDTO) {
        flightValidator.validateSearch(requestDTO);
        return flightApiClient.searchOutboundFlights(requestDTO);
    }

    @Override
    public List<FlightOfferDTO> searchReturnFlights(FlightReturnRequestDTO requestDTO) {
        flightValidator.validateReturnSearch(requestDTO);
        return flightApiClient.searchReturnFlights(requestDTO);
    }
}