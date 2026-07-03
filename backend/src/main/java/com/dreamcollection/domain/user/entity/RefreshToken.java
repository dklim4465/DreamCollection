package com.dreamcollection.domain.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "refresh_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, length = 500)
    private String token;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public RefreshToken(Long userId, String token, String userAgent, String ipAddress, LocalDateTime expiresAt) {
        this.userId = userId;
        this.token = token;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
        this.expiresAt = expiresAt;
    }

    public void revoke() {
        this.revokedAt = LocalDateTime.now();
    }

    public boolean isValid() {
        return revokedAt == null && LocalDateTime.now().isBefore(expiresAt);
    }
}
