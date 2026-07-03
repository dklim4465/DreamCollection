package com.dreamcollection.domain.trip.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/** DB: accommodations_options 테이블 매핑 (추천안에 포함된 숙소 옵션) */
@Entity
@Table(name = "accommodations_options")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccommodationOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recommendation_id", nullable = false)
    private Long recommendationId;

    @Column(name = "accommodation_id")
    private Long accommodationId;

    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType;

    @Column(name = "enter_name", length = 100)
    private String enterName;

    @Column(name = "enter_address", length = 150)
    private String enterAddress;

    private Integer nights;

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
    public AccommodationOption(Long recommendationId, Long accommodationId, String sourceType,
                                String enterName, String enterAddress, Integer nights, Integer displayOrder) {
        this.recommendationId = recommendationId;
        this.accommodationId = accommodationId;
        this.sourceType = sourceType;
        this.enterName = enterName;
        this.enterAddress = enterAddress;
        this.nights = nights;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }
}
