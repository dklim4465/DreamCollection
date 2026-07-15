package com.dreamCollection.flight.api;

import com.dreamCollection.flight.dto.FlightOfferDTO;
import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightReturnRequestDTO;

import java.util.List;

public interface FlightApiClient {

    List<FlightOfferDTO> searchOutboundFlights(FlightRequestDTO requestDTO);

    List<FlightOfferDTO> searchReturnFlights(FlightReturnRequestDTO requestDTO);
}