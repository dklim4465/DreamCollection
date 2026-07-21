package com.dreamCollection.payment.repository;

import com.dreamCollection.payment.entity.PaymentOrder;
import com.dreamCollection.payment.entity.PaymentOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, Long> {
    Optional<PaymentOrder> findByOrderIdAndUserId(String orderId, Long userId);

    @Query("""
            SELECT DISTINCT o FROM PaymentOrder o
            LEFT JOIN FETCH o.items
            WHERE o.userId = :userId AND o.status = :status
            ORDER BY o.paidAt DESC
            """)
    List<PaymentOrder> findByUserIdAndStatusOrderByPaidAtDesc(
            @Param("userId") Long userId,
            @Param("status") PaymentOrderStatus status
    );
}