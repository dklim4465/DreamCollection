package com.backend.user;

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
 * ?Œì› ê¸°ë³¸ ?•ë³´
 * DB: users ?Œì´ë¸?(schema_part1.sql)
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

    // ?Œì…œ ?„ìš© ê°€?…ì??NULL ?ˆìš© (BCrypt ?´ì‹œë§??€?? ?‰ë¬¸ ?ˆë? ?€??ê¸ˆì?)
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

    // ?ˆë²¨/ë±ƒì? ?œìŠ¤?œì? ?€ ?¤ì½”?„ì— ?†ì–´ ?œê±°??(2026-07-01)

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

    /** ?Œì…œ ë¡œê·¸???±ìœ¼ë¡??„ë¡œ???´ë?ì§€ê°€ ê°±ì‹ ?????¬ìš© */
    public void updateProfileImage(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    /** ?Œì›ê°€?????´ë©”???¸ì¦ ë°©ì‹??? íƒ???„ë£Œ??ê²½ìš° ?¸ì¶œ */
    public void markEmailVerified() {
        this.emailVerified = true;
    }
}
