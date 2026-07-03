package com.dreamCollection.trip.repository;

import com.dreamCollection.trip.entity.SavedTrip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedTripRepository extends JpaRepository<SavedTrip, Long> {
    List<SavedTrip> findByUserIdOrderByCreatedDateDesc(Long userId);
}
