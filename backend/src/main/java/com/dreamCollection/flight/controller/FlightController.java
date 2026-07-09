package com.dreamCollection.flight.controller;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import com.dreamCollection.flight.dto.FlightResponseDTO;
import com.dreamCollection.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Log4j2
@RequiredArgsConstructor
@RequestMapping("/api/flight")
public class FlightController {

    private final FlightService flightService;

    @PostMapping("/search")
    public List<FlightResponseDTO> searchFlights(@RequestBody FlightRequestDTO requestDTO) {
        return flightService.searchFlights(requestDTO);
    }
}
