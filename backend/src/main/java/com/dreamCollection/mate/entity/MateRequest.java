package com.dreamCollection.mate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: mate_request 테이블 매핑 (메이트 매칭 요청) */
@Entity
@Table(name = "mate_request", uniqueConstraints = @UniqueConstraint(columnNames = {"mate_post_id", "requester_id"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MateRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mate_post_id", nullable = false)
    private Long matePostId;

    @Column(name = "requester_id", nullable = false)
    private Long requesterId;

    @Column(nullable = false, length = 20)
    private String status = "REQUESTED";

    @Column(length = 200)
    private String message;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MateRequest(Long matePostId, Long requesterId, String message) {
        this.matePostId = matePostId;
        this.requesterId = requesterId;
        this.status = "REQUESTED";
        this.message = message;
    }
}