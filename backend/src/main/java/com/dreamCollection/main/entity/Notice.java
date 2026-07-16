package com.dreamCollection.main.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notice")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Notice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // NULL이면 일반 공지, 값이 있으면 "쿠폰 지급형" 공지 — 상세 페이지에 [쿠폰받기] 버튼이 붙고
    // 클릭 시 이 코드로 CouponService#claimCoupon이 호출된다. (coupon.code 참조)
    @Column(name = "coupon_code", length = 50)
    private String couponCode;

    @Column(name = "is_pinned", nullable = false)
    private boolean pinned = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "view_count", nullable = false)
    private Integer viewCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Notice(Long adminId, String title, String content, String couponCode) {
        this.adminId = adminId;
        this.title = title;
        this.content = content;
        this.couponCode = couponCode;
        this.active = true;
        this.viewCount = 0;
    }
}
