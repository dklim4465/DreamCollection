package com.dreamCollection.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamCollection.trip.entity.Accommodation;

public interface AccommodationRepository extends JpaRepository<Accommodation, Long> {
}
