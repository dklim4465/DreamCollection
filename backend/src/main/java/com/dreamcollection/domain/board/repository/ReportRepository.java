package com.dreamcollection.domain.board.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamcollection.domain.board.entity.Report;

public interface ReportRepository extends JpaRepository<Report, Long> {
}
