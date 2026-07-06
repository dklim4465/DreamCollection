package com.dreamCollection.trip.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

/** DB: trip_payment_items 테이블 매핑 (결제 상세 항목) */
@Entity
@Table(name = "trip_payment_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TripPaymentItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "payment_id", nullable = false)
    private Long paymentId;

    @Column(name = "item_type", nullable = false, length = 20)
    private String itemType;

    @Column(name = "flight_option_id")
    private Long flightOptionId;

    @Column(name = "acc_option_id")
    private Long accOptionId;

    @Column(nullable = false)
    private Integer amount;

    @Column(length = 150)
    private String description;

    @Builder
    public TripPaymentItem(Long paymentId, String itemType, Long flightOptionId,
                            Long accOptionId, Integer amount, String description) {
        this.paymentId = paymentId;
        this.itemType = itemType;
        this.flightOptionId = flightOptionId;
        this.accOptionId = accOptionId;
        this.amount = amount;
        this.description = description;
    }
}
