package com.dreamcollection.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.user.entity.UserPaymentCard;

public interface UserPaymentCardRepository extends JpaRepository<UserPaymentCard, Long> {
    List<UserPaymentCard> findByUserIdAndDeletedAtIsNull(Long userId);
}
