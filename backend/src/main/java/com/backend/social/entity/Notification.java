package com.backend.social;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: notification ?åÏù¥Î∏?Îß§Ìïë. target_type???∞Îùº ?Ä???åÏù¥Î∏îÏù¥ ?¨ÎùºÏßÄ???¥Î¶¨Î™®ÌîΩ Íµ¨Ï°∞??FK ?ÜÏùå */
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
