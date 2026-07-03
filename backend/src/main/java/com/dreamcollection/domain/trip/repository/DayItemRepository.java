package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.trip.entity.DayItem;

public interface DayItemRepository extends JpaRepository<DayItem, Long> {
    List<DayItem> findByDayIdOrderByVisitOrderAsc(Long dayId);
}
