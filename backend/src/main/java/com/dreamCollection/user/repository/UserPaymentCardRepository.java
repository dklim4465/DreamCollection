package com.dreamCollection.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.dreamCollection.user.entity.UserPaymentCard;

public interface UserPaymentCardRepository extends JpaRepository<UserPaymentCard, Long> {
    List<UserPaymentCard> findByUserIdAndDeletedAtIsNull(Long userId);

    // 삭제/기본카드 변경 시, 본인 소유 카드가 맞는지 확인하기 위해 userId까지 함께 조회
    Optional<UserPaymentCard> findByIdAndUserIdAndDeletedAtIsNull(Long id, Long userId);
}
