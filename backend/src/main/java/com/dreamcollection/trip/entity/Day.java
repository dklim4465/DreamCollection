package com.dreamcollection.domain.trip;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/** DB: days 테이블 매핑 (추천안의 일자) */
@Entity
@Table(name = "days")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Day {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recommendation_id", nullable = false)
    private Long recommendationId;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(name = "day_date", nullable = false)
    private LocalDate dayDate;

    @Builder
    public Day(Long recommendationId, Integer dayNumber, LocalDate dayDate) {
        this.recommendationId = recommendationId;
        this.dayNumber = dayNumber;
        this.dayDate = dayDate;
    }
}
