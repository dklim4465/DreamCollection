package com.dreamCollection.trip.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** DB: days_item 테이블 매핑 (일자별 세부 방문 항목) */
@Entity
@Table(name = "days_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DayItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "day_id", nullable = false)
    private Long dayId;

    @Column(name = "visit_order", nullable = false)
    private Integer visitOrder;

    @Column(name = "place_name", nullable = false, length = 100)
    private String placeName;

    @Column(length = 20)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(precision = 10, scale = 7)
    private BigDecimal lat;

    @Column(precision = 10, scale = 7)
    private BigDecimal lng;

    @Builder
    public DayItem(Long dayId, Integer visitOrder, String placeName, String category,
                    String description, BigDecimal lat, BigDecimal lng) {
        this.dayId = dayId;
        this.visitOrder = visitOrder;
        this.placeName = placeName;
        this.category = category;
        this.description = description;
        this.lat = lat;
        this.lng = lng;
    }
}
