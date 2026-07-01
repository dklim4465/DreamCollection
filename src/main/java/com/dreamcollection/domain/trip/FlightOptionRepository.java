package com.dreamcollection.domain.trip;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlightOptionRepository extends JpaRepository<FlightOption, Long> {
    List<FlightOption> findByRecommendationIdOrderByDisplayOrderAsc(Long recommendationId);
}
