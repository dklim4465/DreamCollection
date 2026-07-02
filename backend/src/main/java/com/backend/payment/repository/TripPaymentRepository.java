package com.backend.payment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripPaymentRepository extends JpaRepository<TripPayment, Long> {
    List<TripPayment> findByRequestId(Long requestId);
    Optional<TripPayment> findByImpUid(String impUid);
}
