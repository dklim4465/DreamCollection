package com.dreamCollection.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamCollection.trip.entity.Flight;

public interface FlightRepository extends JpaRepository<Flight, Long> {
}
