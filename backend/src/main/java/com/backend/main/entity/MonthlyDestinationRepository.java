package com.backend.main;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MonthlyDestinationRepository extends JpaRepository<MonthlyDestination, Long> {
    List<MonthlyDestination> findByDisplayMonthAndActiveTrueOrderByDisplayOrderAsc(String displayMonth);
}
