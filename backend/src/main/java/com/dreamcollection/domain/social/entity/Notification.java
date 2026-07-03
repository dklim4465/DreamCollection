package com.dreamcollection.domain.social.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: notification 테이블 매핑. target_type에 따라 대상 테이블이 달라지는 폴리모픽 구조라 FK 없음 */
@Entity
@Table(name = "notification")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 30)
    private String type;

    @Column(name = "target_type", length = 20)
    private String targetType;

    @Column(name = "target_id")
    private Long targetId;

    @Column(nullable = false, length = 255)
    private String content;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Notification(Long userId, String type, String targetType, Long targetId, String content) {
        this.userId = userId;
        this.type = type;
        this.targetType = targetType;
        this.targetId = targetId;
        this.content = content;
        this.read = false;
    }

    public void markRead() {
        this.read = true;
    }
}
