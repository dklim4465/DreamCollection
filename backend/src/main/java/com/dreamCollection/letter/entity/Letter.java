package com.dreamCollection.letter.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 마이페이지 "편지함" — 회원 개인에게 도착하는 시스템 편지함.
 * 현재는 관리자가 문의(Feedback)에 답변했을 때 여기로 편지가 하나 생성된다.
 * 나중에 다른 알림(뱃지 지급, 이벤트 당첨 등)도 이 테이블을 재사용할 수 있도록
 * type/sourceId를 범용적으로 남겨둔다.
 */
@Entity
@Table(name = "letter")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Letter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 20)
    private String type; // FEEDBACK_ANSWER | (추후 확장)

    @Column(name = "source_id")
    private Long sourceId; // type=FEEDBACK_ANSWER 일 때 원본 feedback.id

    @Column(nullable = false, length = 200)
    private String title;

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Letter(Long userId, String type, Long sourceId, String title, String content) {
        this.userId = userId;
        this.type = type;
        this.sourceId = sourceId;
        this.title = title;
        this.content = content;
        this.read = false;
    }

    public void markRead() {
        this.read = true;
    }
}