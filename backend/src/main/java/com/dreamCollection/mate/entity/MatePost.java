package com.dreamCollection.mate.entity;

import jakarta.persistence.*;
import lombok.*;
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

    @Column(name = "country_code", length = 10)
    private String countryCode;

    @Column(name = "country_name", length = 50)
    private String countryName;

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

    /**
     * 소프트 삭제 — row를 진짜로 지우지 않고 status만 DELETED로 바꾼다.
     * 이 글을 참조하는 chat_room(mate_post_id NOT NULL FK)이 있으면 실제 삭제 시
     * FK ON DELETE CASCADE로 채팅방/채팅 기록까지 같이 사라지기 때문에,
     * 채팅방을 보존하기 위해 하드 삭제 대신 이 방식을 쓴다.
     */
    public void markAsDeleted() {
        this.status = "DELETED";
    }
}