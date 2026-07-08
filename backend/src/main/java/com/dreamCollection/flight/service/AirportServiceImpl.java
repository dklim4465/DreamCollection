package com.dreamCollection.flight.service;

import com.dreamCollection.flight.dto.AirportOptionDTO;
import com.dreamCollection.flight.entity.Airport;
import com.dreamCollection.flight.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AirportServiceImpl implements AirportService{

    private static final int DEFAULT_LIMIT = 5;

    private final AirportRepository airportRepository;

    @Override
    public List<AirportOptionDTO> recommendAirports(String region, Integer limit){
        int resultLimit = resolveLimit(limit);

        return airportRepository.findByRegionOrderByDisplayOrderAsc(region)
                .stream()
                .limit(resultLimit)
                .map(this::airportOptionDTO)
                .toList();
    }

    private int resolveLimit(Integer limit){
        if (limit == null || limit <=0){
            return DEFAULT_LIMIT;
        }

        return limit;
    }

    private AirportOptionDTO airportOptionDTO(Airport airport){
        return AirportOptionDTO.builder()
                .airportId(airport.getId())
                .airportCode(airport.getAirportCode())
                .airportName(airport.getAirportName())
                .cityName(airport.getCityName())
                .countryName(airport.getCountryName())
                .region(airport.getRegion())
                .latitude(airport.getLatitude())
                .longitude(airport.getLongitude())
                .build();
    }
}
