package com.dreamCollection.board.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** DB: board_post 테이블 매핑 (게시글: 예약양도/자유/후기) */
@Entity
@Table(name = "board_post")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 20)
    private String category;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @Column(name = "like_count", nullable = false)
    private Integer likeCount = 0;

    @Column(name = "trade_status", length = 20)
    private String tradeStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public BoardPost(Long userId, String category, String title, String content, BigDecimal price) {
        this.userId = userId;
        this.category = category;
        this.title = title;
        this.content = content;
        this.price = price;
        this.viewCount = 0;
        this.likeCount = 0;
        if ("TRANSFER".equals(category)) {
            this.tradeStatus = "ON_SALE";
        }
    }

    public void increaseViewCount() {
        this.viewCount++;
    }
}
