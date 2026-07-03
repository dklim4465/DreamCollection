package com.dreamcollection.domain.verification.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false, unique = true, length = 64)
    private String token;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public PasswordResetToken(Long userId, String token, LocalDateTime expiresAt) {
        this.userId = userId;
        this.token = token;
        this.expiresAt = expiresAt;
    }

    public boolean isValid() {
        return usedAt == null && LocalDateTime.now().isBefore(expiresAt);
    }

    public void markUsed() {
        this.usedAt = LocalDateTime.now();
    }
}
