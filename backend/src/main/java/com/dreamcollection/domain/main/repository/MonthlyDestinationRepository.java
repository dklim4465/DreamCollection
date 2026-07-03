package com.dreamcollection.domain.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.main.entity.MonthlyDestination;

public interface MonthlyDestinationRepository extends JpaRepository<MonthlyDestination, Long> {
    List<MonthlyDestination> findByDisplayMonthAndActiveTrueOrderByDisplayOrderAsc(String displayMonth);
}
