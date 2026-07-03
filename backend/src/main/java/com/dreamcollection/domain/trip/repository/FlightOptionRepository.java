package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.trip.entity.FlightOption;

public interface FlightOptionRepository extends JpaRepository<FlightOption, Long> {
    List<FlightOption> findByRecommendationIdOrderByDisplayOrderAsc(Long recommendationId);
}
