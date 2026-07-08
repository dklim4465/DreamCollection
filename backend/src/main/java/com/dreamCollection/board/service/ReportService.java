package com.dreamCollection.board.service;

import com.dreamCollection.board.dto.ReportCreateRequestDTO;
import com.dreamCollection.board.dto.ReportResponseDTO;
import com.dreamCollection.board.entity.Report;
import com.dreamCollection.board.exception.DuplicateReportException;
import com.dreamCollection.board.exception.InvalidReportTargetTypeException;
import com.dreamCollection.board.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final Set<String> ALLOWED_TARGET_TYPES = Set.of("POST", "COMMENT", "USER");

    private final ReportRepository reportRepository;

    @Transactional
    public ReportResponseDTO createReport(Long reporterId, ReportCreateRequestDTO requestDTO) {
        String targetType = requestDTO.getTargetType() == null ? null : requestDTO.getTargetType().toUpperCase();
        if (!ALLOWED_TARGET_TYPES.contains(targetType)) {
            throw new InvalidReportTargetTypeException();
        }

        if (reportRepository.existsByReporterIdAndTargetTypeAndTargetId(
                reporterId, targetType, requestDTO.getTargetId())) {
            throw new DuplicateReportException();
        }

        Report report = Report.builder()
                .reporterId(reporterId)
                .targetType(targetType)
                .targetId(requestDTO.getTargetId())
                .reason(requestDTO.getReason())
                .build();

        Report saved = reportRepository.save(report);
        return ReportResponseDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<ReportResponseDTO> getMyReports(Long reporterId) {
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(reporterId).stream()
                .map(ReportResponseDTO::from)
                .toList();
    }
}