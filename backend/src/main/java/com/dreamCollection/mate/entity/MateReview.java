package com.dreamCollection.mate.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: mate_review 테이블 매핑 (메이트 후기) */
@Entity
@Table(name = "mate_review")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MateReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mate_post_id", nullable = false)
    private Long matePostId;

    @Column(name = "reviewer_id", nullable = false)
    private Long reviewerId;

    @Column(name = "reviewee_id", nullable = false)
    private Long revieweeId;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 500)
    private String content;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public MateReview(Long matePostId, Long reviewerId, Long revieweeId, Integer rating, String content) {
        this.matePostId = matePostId;
        this.reviewerId = reviewerId;
        this.revieweeId = revieweeId;
        this.rating = rating;
        this.content = content;
    }
}
