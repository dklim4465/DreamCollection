package com.dreamcollection.domain.trip;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** DB: trip_requests 테이블 매핑 (여행 조건 요청 — AI 추천의 시작점) */
@Entity
@Table(name = "trip_requests")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TripRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "companion_type", nullable = false, length = 20)
    private String companionType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, length = 50)
    private String destination;

    @Column(length = 30)
    private String theme;

    @Column(name = "density_level", length = 10)
    private String densityLevel;

    @Column(nullable = false, length = 20)
    private String status = "PENDING";

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    void prePersist() {
        this.createdDate = LocalDateTime.now();
    }

    @Builder
    public TripRequest(Long userId, String companionType, LocalDate startDate, LocalDate endDate,
                        String destination, String theme, String densityLevel) {
        this.userId = userId;
        this.companionType = companionType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.destination = destination;
        this.theme = theme;
        this.densityLevel = densityLevel;
        this.status = "PENDING";
    }
}
