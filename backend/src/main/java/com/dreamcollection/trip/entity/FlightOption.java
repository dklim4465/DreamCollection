package com.dreamcollection.trip.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** DB: flights_options 테이블 매핑 (추천안에 포함된 항공 옵션) */
@Entity
@Table(name = "flights_options")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FlightOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recommendation_id", nullable = false)
    private Long recommendationId;

    @Column(name = "flight_id")
    private Long flightId;

    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType;

    @Column(name = "enter_airline", length = 50)
    private String enterAirline;

    @Column(name = "enter_schedule", length = 100)
    private String enterSchedule;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_sel", nullable = false)
    private boolean selected = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    @Builder
    public FlightOption(Long recommendationId, Long flightId, String sourceType,
                         String enterAirline, String enterSchedule, Integer displayOrder) {
        this.recommendationId = recommendationId;
        this.flightId = flightId;
        this.sourceType = sourceType;
        this.enterAirline = enterAirline;
        this.enterSchedule = enterSchedule;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }
}
