package com.dreamCollection.board.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamCollection.board.entity.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
