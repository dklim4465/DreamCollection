package com.dreamCollection.flight.service;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightOfferDTO;

import java.util.List;

public interface FlightService {
    List<FlightOfferDTO> searchFlights(FlightRequestDTO requestDTO);
}
