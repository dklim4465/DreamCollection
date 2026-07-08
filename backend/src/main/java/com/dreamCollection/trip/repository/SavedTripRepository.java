package com.dreamCollection.trip.repository;

import com.dreamCollection.trip.entity.SavedTrip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SavedTripRepository extends JpaRepository<SavedTrip, Long> {
    List<SavedTrip> findByUserIdOrderByCreatedDateDesc(Long userId);

    // 마이페이지 레벨 시스템 — 유저별 저장된 여행 횟수
    long countByUserId(Long userId);
}
