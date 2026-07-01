package com.dreamcollection.domain.trip;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** DB: recommendations 테이블 매핑 (AI 추천 결과 = 일정 후보) */
@Entity
@Table(name = "recommendations")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "ai_text", columnDefinition = "TEXT")
    private String aiText;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_sel", nullable = false)
    private boolean selected = false;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    void prePersist() {
        this.createdDate = LocalDateTime.now();
    }

    @Builder
    public Recommendation(Long requestId, String aiText, Integer displayOrder) {
        this.requestId = requestId;
        this.aiText = aiText;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }
}
