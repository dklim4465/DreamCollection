package com.dreamCollection.trip.repository;

import com.dreamCollection.trip.entity.SavedTrip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SavedTripRepository extends JpaRepository<SavedTrip, Long> {
    long countByUserId(Long userId);
    List<SavedTrip> findByUserIdOrderByCreatedDateDesc(Long userId);
    Optional<SavedTrip> findByIdAndUserId(Long id, Long userId);
}
