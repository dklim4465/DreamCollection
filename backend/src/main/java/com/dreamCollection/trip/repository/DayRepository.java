package com.dreamCollection.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.trip.entity.Day;

public interface DayRepository extends JpaRepository<Day, Long> {
    List<Day> findByRecommendationIdOrderByDayNumberAsc(Long recommendationId);
}
