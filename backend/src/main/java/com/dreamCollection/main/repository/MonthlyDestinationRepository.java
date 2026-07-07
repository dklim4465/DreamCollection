package com.dreamCollection.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.main.entity.MonthlyDestination;

public interface MonthlyDestinationRepository extends JpaRepository<MonthlyDestination, Long> {
    List<MonthlyDestination> findByDisplayMonthAndActiveTrueOrderByDisplayOrderAsc(String displayMonth);
}
