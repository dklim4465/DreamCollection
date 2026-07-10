package com.dreamCollection.user.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: user_payment_cards 테이블 매핑. 카드 원본 정보는 저장하지 않고 PG사 발급 billing_key만 저장 */
@Entity
@Table(name = "user_payment_cards")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserPaymentCard {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "card_company", length = 30)
    private String cardCompany;

    @Column(name = "card_last4", length = 4)
    private String cardLast4;

    @Column(name = "billing_key", nullable = false, length = 255)
    private String billingKey;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Builder
    public UserPaymentCard(Long userId, String cardCompany, String cardLast4, String billingKey) {
        this.userId = userId;
        this.cardCompany = cardCompany;
        this.cardLast4 = cardLast4;
        this.billingKey = billingKey;
        this.isDefault = true;
    }

    /** 마이페이지 "기본 결제수단으로 설정" */
    public void markAsDefault() {
        this.isDefault = true;
    }

    /** 다른 카드를 기본으로 설정하기 전, 기존 기본카드의 표시를 해제 */
    public void unmarkAsDefault() {
        this.isDefault = false;
    }

    /** 마이페이지 "결제수단 삭제" — 실제 삭제 대신 soft delete (결제 이력 추적을 위해 행은 남겨둠) */
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        this.isDefault = false;
    }
}
