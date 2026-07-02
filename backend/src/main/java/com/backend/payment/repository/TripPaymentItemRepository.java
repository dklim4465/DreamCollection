package com.backend.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TripPaymentItemRepository extends JpaRepository<TripPaymentItem, Long> {
    List<TripPaymentItem> findByPaymentId(Long paymentId);
}
