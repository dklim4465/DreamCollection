package com.dreamCollection.payment.repository;

import com.dreamCollection.payment.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderIdAndUserId(String orderId, Long userId);
}