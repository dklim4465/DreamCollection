package com.dreamCollection.board.dto;

import com.dreamCollection.board.entity.Report;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ReportResponseDTO {

    private final Long id;
    private final Long reporterId;
    private final String targetType;
    private final Long targetId;
    private final String reason;
    private final String status;
    private final LocalDateTime createdAt;

    public static ReportResponseDTO from(Report report){
        return new ReportResponseDTO(
                report.getId(), report.getReporterId(), report.getTargetType(),
                report.getTargetId(), report.getReason(), report.getStatus(), report.getCreatedAt()
        );
    }
}
