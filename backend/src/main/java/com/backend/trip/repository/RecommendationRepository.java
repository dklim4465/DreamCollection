package com.backend.trip.repository;

import com.backend.trip.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    List<Recommendation> findByRequestIdOrderByDisplayOrderAsc(Long requestId);

    Optional<Recommendation> findByRequestIdAndSelectedTrue(Long requestId);
}
