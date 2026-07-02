package com.backend.travelog;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: travel_log ?åÏù¥Î∏?Îß§Ìïë (?¨Ìñâ?ºÏ?) */
@Entity
@Table(name = "travel_log")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TravelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "request_id")
    private Long requestId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String memo;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public TravelLog(Long userId, Long requestId, String title, String memo) {
        this.userId = userId;
        this.requestId = requestId;
        this.title = title;
        this.memo = memo;
    }
}
