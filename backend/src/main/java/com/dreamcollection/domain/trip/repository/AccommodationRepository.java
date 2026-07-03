package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamcollection.domain.trip.entity.Accommodation;

public interface AccommodationRepository extends JpaRepository<Accommodation, Long> {
}
