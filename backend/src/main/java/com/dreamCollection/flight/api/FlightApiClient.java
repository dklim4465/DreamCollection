package com.dreamCollection.flight.api;

import com.dreamCollection.flight.dto.FlightOfferDTO;
import com.dreamCollection.flight.dto.FlightRequestDTO;

import java.util.List;

public interface FlightApiClient {

    List<FlightOfferDTO> searchFlights(FlightRequestDTO requestDTO);
}