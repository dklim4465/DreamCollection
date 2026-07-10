package com.dreamCollection.mypage.repository;

import com.dreamCollection.trip.entity.SavedTrip;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * 마이페이지 "내가 저장한 여행" 목록 조회 전용 repository.
 * trip 팀이 관리하는 SavedTripRepository는 건드리지 않고,
 * 같은 SavedTrip 엔티티에 대해 별도의 JpaRepository를 두어 분리한다.
 */
public interface MySavedTripRepository extends JpaRepository<SavedTrip, Long> {
    List<SavedTrip> findByUserIdOrderByCreatedDateDesc(Long userId);
}
