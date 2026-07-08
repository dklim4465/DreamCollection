package com.dreamCollection.board.repository;

import com.dreamCollection.board.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByReporterIdAndTargetTypeAndTargetId (Long reporterId, String targetType, Long targetId);
    List<Report> findByReporterIdOrderByCreatedAtDesc (Long reporterId);
}
