package com.dreamCollection.payment.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "payment_travelers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentTraveler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_pk", nullable = false)
    private PaymentOrder order;

    @Column(name = "full_name", nullable = false, length = 50)
    private String fullName;

    @Column(name = "birth_date", nullable = false)
    private LocalDate birthDate;

    @Column(nullable = false, length = 1)
    private String gender;

    @Column(name = "passport_number", nullable = false, length = 30)
    private String passportNumber;

    @Column(name = "passport_expiry", nullable = false)
    private LocalDate passportExpiry;

    @Column(length = 20)
    private String phone;

    @Column(name = "is_representative", nullable = false)
    private boolean representative;

    @Column(name = "sort_order", nullable = false)
    private int sortOrder;

    @Builder
    public PaymentTraveler(String fullName, LocalDate birthDate, String gender,
                           String passportNumber, LocalDate passportExpiry,
                           String phone, boolean representative, int sortOrder) {
        this.fullName = fullName;
        this.birthDate = birthDate;
        this.gender = gender;
        this.passportNumber = passportNumber;
        this.passportExpiry = passportExpiry;
        this.phone = phone;
        this.representative = representative;
        this.sortOrder = sortOrder;
    }

    void setOrder(PaymentOrder order) {
        this.order = order;
    }
}