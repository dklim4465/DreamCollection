package com.dreamCollection.coupon.dto;

import com.dreamCollection.coupon.entity.Coupon;
import com.dreamCollection.coupon.entity.UserCoupon;

import java.time.LocalDateTime;

/**
 * 마이페이지 "보관함" 탭에서 사용.
 */
public record MyCouponResponse(
        Long id,
        String code,
        String name,
        String description,
        String discountType,
        Integer discountValue,
        String status,
        LocalDateTime issuedAt,
        LocalDateTime expiresAt
) {
    public static MyCouponResponse of(UserCoupon userCoupon, Coupon coupon) {
        return new MyCouponResponse(
                userCoupon.getId(),
                coupon.getCode(),
                coupon.getName(),
                coupon.getDescription(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                userCoupon.getStatus().name(),
                userCoupon.getIssuedAt(),
                userCoupon.getExpiresAt()
        );
    }
}
