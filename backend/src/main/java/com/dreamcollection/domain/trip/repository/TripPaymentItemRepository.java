package com.dreamcollection.domain.trip.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.trip.entity.TripPaymentItem;

public interface TripPaymentItemRepository extends JpaRepository<TripPaymentItem, Long> {
    List<TripPaymentItem> findByPaymentId(Long paymentId);
}
