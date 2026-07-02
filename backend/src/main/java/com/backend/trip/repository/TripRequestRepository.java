package com.backend.trip.repository;

import com.backend.trip.entity.TripRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TripRequestRepository extends JpaRepository<TripRequest, Long> {

    List<TripRequest> findByUserIdOrderByStartDateAsc(Long userId);

    // 메인페이지 "다가오는 내 일정" 위젯용
    List<TripRequest> findByUserIdAndStartDateGreaterThanEqualOrderByStartDateAsc(Long userId, LocalDate today);
}
