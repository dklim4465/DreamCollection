package com.dreamCollection.flight.service;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightResponseDTO;

import java.util.List;

public interface FlightService {
    List<FlightResponseDTO> searchFlights(FlightRequestDTO requestDTO);
}
