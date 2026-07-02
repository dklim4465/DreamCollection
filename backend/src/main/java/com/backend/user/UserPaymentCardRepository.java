package com.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPaymentCardRepository extends JpaRepository<UserPaymentCard, Long> {
    List<UserPaymentCard> findByUserIdAndDeletedAtIsNull(Long userId);
}
