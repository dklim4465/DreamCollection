package com.dreamcollection.domain.trip;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DayItemRepository extends JpaRepository<DayItem, Long> {
    List<DayItem> findByDayIdOrderByVisitOrderAsc(Long dayId);
}
