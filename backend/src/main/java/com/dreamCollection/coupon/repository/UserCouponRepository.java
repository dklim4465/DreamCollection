package com.dreamCollection.coupon.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.coupon.entity.UserCoupon;

public interface UserCouponRepository extends JpaRepository<UserCoupon, Long> {
    List<UserCoupon> findByUserIdOrderByIssuedAtDesc(Long userId);
    boolean existsByUserIdAndCouponId(Long userId, Long couponId);
}
