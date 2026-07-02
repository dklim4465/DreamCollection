package com.backend.accommodation.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccommodationOptionRepository extends JpaRepository<AccommodationOption, Long> {
    List<AccommodationOption> findByRecommendationIdOrderByDisplayOrderAsc(Long recommendationId);
}
