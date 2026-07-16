package com.dreamCollection.payment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment_orders")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
// 결제라 보호
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true, length = 64)
    private String orderId;
    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "saved_trip_id", nullable = false)
    private Long savedTripId;
    @Column(name = "adult_count", nullable = false)
    private int adultCount;
    @Column(name = "total_amount", nullable = false)
    private int totalAmount;

    @Column(name = "payment_key", length = 200)
    private String paymentKey;
    @Column(name = "card_id")
    private Long cardId;
    @Column(name = "fail_reason", length = 255)
    private String failReason;
    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false,length = 20)
    private PaymentOrderStatus status;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentOrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentTraveler> travelers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public PaymentOrder(String orderId, Long userId, Long savedTripId, int adultCount, int totalAmount) {
        this.orderId = orderId;
        this.userId = userId;
        this.savedTripId = savedTripId;
        this.adultCount = adultCount;
        this.totalAmount = totalAmount;
        this.status = PaymentOrderStatus.PENDING;
    }
    public void addItem(PaymentOrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
    public void addTraveler(PaymentTraveler traveler) {
        travelers.add(traveler);
        traveler.setOrder(this);
    }
    public void markPaid(String paymentKey, Long cardId) {
        this.status = PaymentOrderStatus.PAID;
        this.paymentKey = paymentKey;
        this.cardId = cardId;
        this.paidAt = LocalDateTime.now();
        this.failReason = null;
    }
    public void markFailed(String failReason, Long cardId) {
        this.status = PaymentOrderStatus.FAILED;
        this.failReason = failReason;
        this.cardId = cardId;
    }
    public void assignTotalAmount(int totalAmount) {
        this.totalAmount = totalAmount;
    }
}
