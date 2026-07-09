package com.dreamCollection.flight.repository;


import com.dreamCollection.flight.entity.Airport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlightRepository extends JpaRepository<Airport ,Long> {
    List<Airport> findByRegionOrderByDisplayOrderAsc(String region);
}
