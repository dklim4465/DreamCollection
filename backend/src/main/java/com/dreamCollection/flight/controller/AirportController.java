package com.dreamCollection.flight.controller;

import com.dreamCollection.flight.dto.AirportOptionDTO;
import com.dreamCollection.flight.service.AirportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/flight/airports")
@RequiredArgsConstructor
public class AirportController {

    private final AirportService airportService;

    @GetMapping("/recommend")
    public List<AirportOptionDTO> recommendAirports(@RequestParam String region, @RequestParam(required = false)Integer limit){
        return airportService.recommendAirports(region,limit);
    }
}
