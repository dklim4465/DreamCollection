package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

import com.dreamcollection.domain.trip.entity.TripRequest;

public interface TripRequestRepository extends JpaRepository<TripRequest, Long> {

    List<TripRequest> findByUserIdOrderByStartDateAsc(Long userId);

    // 메인페이지 "다가오는 내 일정" 위젯용
    List<TripRequest> findByUserIdAndStartDateGreaterThanEqualOrderByStartDateAsc(Long userId, LocalDate today);
}
