package com.dreamcollection.domain.mate;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** DB: mate_post 테이블 매핑 (메이트 모집글) */
@Entity
@Table(name = "mate_post")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MatePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "city_id")
    private Long cityId;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "preferred_age", length = 20)
    private String preferredAge;

    @Column(name = "preferred_gender", length = 10)
    private String preferredGender;

    @Column(name = "travel_style", length = 50)
    private String travelStyle;

    @Column(name = "recruit_count", nullable = false)
    private Integer recruitCount = 1;

    @Column(nullable = false, length = 20)
    private String status = "RECRUITING";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MatePost(Long userId, Long cityId, String destination, LocalDate startDate, LocalDate endDate,
                     String content, String preferredAge, String preferredGender, String travelStyle,
                     Integer recruitCount) {
        this.userId = userId;
        this.cityId = cityId;
        this.destination = destination;
        this.startDate = startDate;
        this.endDate = endDate;
        this.content = content;
        this.preferredAge = preferredAge;
        this.preferredGender = preferredGender;
        this.travelStyle = travelStyle;
        this.recruitCount = recruitCount != null ? recruitCount : 1;
        this.status = "RECRUITING";
    }
}
