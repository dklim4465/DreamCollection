package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.dreamcollection.domain.trip.entity.Recommendation;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByRequestIdOrderByDisplayOrderAsc(Long requestId);

    Optional<Recommendation> findByRequestIdAndSelectedTrue(Long requestId);
}
