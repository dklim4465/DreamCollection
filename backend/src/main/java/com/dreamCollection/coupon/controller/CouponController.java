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
 *  - GET  /api/coupons/me          → 마이페이지 "보관함" 목록
 *  - POST /api/coupons/claim/{code} → 공지사항 상세의 [쿠폰받기] 버튼 클릭 시 지급
 *    (어떤 공지가 어떤 쿠폰을 주는지는 notice.coupon_code에 저장되어 있고,
 *     프론트는 공지 상세에서 받아온 그 코드를 그대로 이 API에 전달한다.)
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

    @PostMapping("/claim/{code}")
    public ApiResponse<Void> claimCoupon(@PathVariable String code, Authentication authentication) {
        Long userId = resolveUserId(authentication);
        couponService.claimCoupon(userId, code);
        return ApiResponse.ok(null, "쿠폰이 보관함에 지급되었습니다.");
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new InvalidCredentialsException();
        }
        return userId;
    }
}
