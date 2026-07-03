package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamcollection.domain.trip.entity.Flight;

public interface FlightRepository extends JpaRepository<Flight, Long> {
}
