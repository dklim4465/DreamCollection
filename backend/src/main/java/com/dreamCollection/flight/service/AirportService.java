package com.dreamCollection.flight.service;

import com.dreamCollection.flight.dto.AirportOptionDTO;

import java.util.List;

public interface AirportService {

    List<AirportOptionDTO> recommendAirports(String region, Integer limit);
}
