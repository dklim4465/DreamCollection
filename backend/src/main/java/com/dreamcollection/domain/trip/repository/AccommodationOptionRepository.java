package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.trip.entity.AccommodationOption;

public interface AccommodationOptionRepository extends JpaRepository<AccommodationOption, Long> {
    List<AccommodationOption> findByRecommendationIdOrderByDisplayOrderAsc(Long recommendationId);
}
