package com.dreamCollection.trip.repository;

import com.dreamCollection.trip.entity.SavedTrip;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface SavedTripRepository extends JpaRepository<SavedTrip, Long>, JpaSpecificationExecutor<SavedTrip> {
    long countByUserId(Long userId);
    List<SavedTrip> findByUserIdOrderByCreatedDateDesc(Long userId);
    Optional<SavedTrip> findByIdAndUserId(Long id, Long userId);

    Page<SavedTrip> findByUserId(Long userId, Pageable pageable);
}
