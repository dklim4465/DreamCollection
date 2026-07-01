package com.dreamcollection.domain.trip;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DayRepository extends JpaRepository<Day, Long> {
    List<Day> findByRecommendationIdOrderByDayNumberAsc(Long recommendationId);
}
