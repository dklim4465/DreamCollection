package com.dreamCollection.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 회원 기본 정보
 * DB: users 테이블 (schema_part1.sql)
 */
@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_users_uuid", columnNames = "uuid"),
                @UniqueConstraint(name = "uk_users_nickname", columnNames = "nickname")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, updatable = false, length = 36)
    private String uuid;

    @Column(nullable = false, length = 255)
    private String email;

    // 소셜 전용 가입자는 NULL 허용 (BCrypt 해시만 저장, 평문 절대 저장 금지)
    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 30)
    private String nickname;

    @Column(length = 20)
    private String phone;

    @Column(name = "phone_verified", nullable = false)
    private boolean phoneVerified;

    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    @Column(name = "profile_image_url", length = 500)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "travel_style", nullable = false, length = 20)
    private TravelStyle travelStyle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    // 레벨/뱃지 시스템은 팀 스코프에 없어 제거됨 (2026-07-01)

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "withdrawn_at")
    private LocalDateTime withdrawnAt;

    @Builder
    private User(String email, String passwordHash, String name, String nickname,
                  String phone, boolean phoneVerified, TravelStyle travelStyle) {
        this.uuid = UUID.randomUUID().toString();
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.nickname = nickname;
        this.phone = phone;
        this.phoneVerified = phoneVerified;
        this.emailVerified = false;
        this.travelStyle = travelStyle != null ? travelStyle : TravelStyle.RELAXED;
        this.role = Role.USER;
        this.status = UserStatus.ACTIVE;
    }

    /** 소셜 로그인 등으로 프로필 이미지가 갱신될 때 사용 */
    public void updateProfileImage(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    /**
     * 마이페이지 "프로필 수정"에서 사용. null인 필드는 그대로 두고, 값이 있는 필드만 갱신한다.
     */
    public void updateProfile(String nickname, String profileImageUrl, TravelStyle travelStyle) {
        if (nickname != null && !nickname.isBlank()) {
            this.nickname = nickname;
        }
        if (profileImageUrl != null) {
            this.profileImageUrl = profileImageUrl;
        }
        if (travelStyle != null) {
            this.travelStyle = travelStyle;
        }
    }

    /** 회원가입 시 이메일 인증 방식을 선택해 완료한 경우 호출 */
    public void markEmailVerified() {
        this.emailVerified = true;
    }

    /** 관리자 페이지에서 회원 상태(정상/정지/탈퇴) 변경 시 사용 */
    public void changeStatus(UserStatus status) {
        this.status = status;
        if (status == UserStatus.WITHDRAWN) {
            this.withdrawnAt = LocalDateTime.now();
        } else {
            this.withdrawnAt = null;
        }
    }
}
