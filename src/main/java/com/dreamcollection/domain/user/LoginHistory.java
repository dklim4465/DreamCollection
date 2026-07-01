package com.dreamcollection.domain.user;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "login_type", nullable = false, length = 20)
    private LoginType loginType;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(nullable = false)
    private boolean success = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public LoginHistory(Long userId, LoginType loginType, String ipAddress, String userAgent, boolean success) {
        this.userId = userId;
        this.loginType = loginType;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.success = success;
    }

    public enum LoginType { EMAIL, GOOGLE, KAKAO, NAVER }
}
