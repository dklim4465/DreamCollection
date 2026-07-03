package com.dreamcollection.domain.user.entity;

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
}
