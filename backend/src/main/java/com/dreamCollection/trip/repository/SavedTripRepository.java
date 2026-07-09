package com.dreamCollection.trip.repository;

import com.dreamCollection.trip.entity.SavedTrip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedTripRepository extends JpaRepository<SavedTrip, Long> {

    // 마이페이지 레벨 시스템 — 유저별 저장된 여행 횟수 (LevelService, StatsService에서 사용)
    long countByUserId(Long userId);
}
