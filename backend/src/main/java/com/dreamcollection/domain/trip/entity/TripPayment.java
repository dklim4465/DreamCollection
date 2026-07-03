package com.dreamcollection.domain.trip.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/** DB: trip_payments 테이블 매핑 (결제 — PortOne/카카오페이) */
@Entity
@Table(name = "trip_payments")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TripPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(name = "payment_status", nullable = false, length = 20)
    private String paymentStatus = "READY";

    @Column(name = "partner_order_id", length = 100)
    private String partnerOrderId;

    @Column(name = "partner_user_id", length = 100)
    private String partnerUserId;

    @Column(name = "imp_uid", length = 100)
    private String impUid;

    @Column(length = 100)
    private String tid;

    @Column(length = 100)
    private String aid;

    @Column(name = "next_redirect_pc_url", length = 255)
    private String nextRedirectPcUrl;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Column(name = "fail_reason", length = 255)
    private String failReason;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @PrePersist
    void prePersist() {
        this.createdDate = LocalDateTime.now();
    }

    @Builder
    public TripPayment(Long requestId, String partnerOrderId, String partnerUserId) {
        this.requestId = requestId;
        this.partnerOrderId = partnerOrderId;
        this.partnerUserId = partnerUserId;
        this.paymentStatus = "READY";
    }
}
