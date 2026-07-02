package com.backend.trip.repository;

import com.backend.trip.entity.Day;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DayRepository extends JpaRepository<Day, Long> {
    List<Day> findByRecommendationIdOrderByDayNumberAsc(Long recommendationId);
}
