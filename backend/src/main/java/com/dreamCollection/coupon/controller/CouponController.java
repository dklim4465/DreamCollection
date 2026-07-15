package com.dreamCollection.coupon.controller;

import com.dreamCollection.coupon.dto.MyCouponResponse;
import com.dreamCollection.coupon.service.CouponService;
import com.dreamCollection.global.exception.InvalidCredentialsException;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 프론트: profile/api/couponApi.ts
 *  - GET  /api/coupons/me           → 마이페이지 "보관함" 목록
 *  - POST /api/coupons/claim-event  → 7월 이벤트 배너 클릭(기존 회원) 시 5% 쿠폰 발급
 * SecurityConfig에서 /api/coupons/**는 공개 목록에 없으므로 기본적으로 로그인 필요.
 */
@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/me")
    public ApiResponse<List<MyCouponResponse>> getMyCoupons(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return ApiResponse.ok(couponService.getMyCoupons(userId));
    }

    @PostMapping("/claim-event")
    public ApiResponse<Void> claimEventCoupon(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        couponService.claimReturningCoupon(userId);
        return ApiResponse.ok(null, "5% 할인 쿠폰이 보관함에 지급되었습니다.");
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new InvalidCredentialsException();
        }
        return userId;
    }
}
