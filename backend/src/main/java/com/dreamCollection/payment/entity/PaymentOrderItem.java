package com.dreamCollection.payment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_order_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_pk", nullable = false)
    private PaymentOrder order;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type", nullable = false, length = 20)
    private PaymentItemType itemType;

    @Column(name = "unit_price")
    private Integer unitPrice;

    private Integer quantity;

    @Column(nullable = false)
    private int amount;

    @Column(length = 200)
    private String title;

    @Builder
    public PaymentOrderItem(PaymentItemType itemType, Integer unitPrice, Integer quantity, int amount, String title) {
        this.itemType = itemType;
        this.unitPrice = unitPrice;
        this.quantity = quantity;
        this.amount = amount;
        this.title = title;
    }

    void setOrder(PaymentOrder order) {
        this.order = order;
    }
}