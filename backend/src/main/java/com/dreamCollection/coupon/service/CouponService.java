package com.dreamCollection.coupon.service;

import com.dreamCollection.coupon.dto.MyCouponResponse;
import com.dreamCollection.coupon.entity.Coupon;
import com.dreamCollection.coupon.entity.UserCoupon;
import com.dreamCollection.coupon.repository.CouponRepository;
import com.dreamCollection.coupon.repository.UserCouponRepository;
import com.dreamCollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 2026-07 신규가입 이벤트 쿠폰 발급/조회.
 *  - WELCOME10  : 신규 가입 시 자동 지급 (10% 할인)
 *  - RETURNING5 : 기존 회원이 이벤트 배너를 클릭하면 지급 (5% 할인)
 * 두 경우 모두 1인 1매만 지급되도록 user_coupon(user_id, coupon_id) 유니크 제약으로 방지.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CouponService {

    public static final String WELCOME_COUPON_CODE = "WELCOME10";
    public static final String RETURNING_COUPON_CODE = "RETURNING5";

    private final CouponRepository couponRepository;
    private final UserCouponRepository userCouponRepository;

    @Transactional(readOnly = true)
    public List<MyCouponResponse> getMyCoupons(Long userId) {
        List<UserCoupon> myCoupons = userCouponRepository.findByUserIdOrderByIssuedAtDesc(userId);
        Map<Long, Coupon> couponById = couponRepository.findAllById(
                myCoupons.stream().map(UserCoupon::getCouponId).toList()
        ).stream().collect(Collectors.toMap(Coupon::getId, c -> c));

        return myCoupons.stream()
                .map(uc -> MyCouponResponse.of(uc, couponById.get(uc.getCouponId())))
                .toList();
    }

    /** 회원가입 시 자동 지급. 실패해도 회원가입 자체를 막지 않도록 호출부(UserService)에서 try-catch 처리. */
    @Transactional
    public void grantWelcomeCoupon(Long userId) {
        grantByCode(userId, WELCOME_COUPON_CODE);
    }

    /**
     * 기존 회원이 이벤트 배너를 클릭했을 때 호출.
     * 이미 발급받은 적이 있으면 새로 발급하지 않고 조용히 무시(중복 클릭 방지).
     */
    @Transactional
    public void claimReturningCoupon(Long userId) {
        grantByCode(userId, RETURNING_COUPON_CODE);
    }

    private void grantByCode(Long userId, String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException("존재하지 않는 쿠폰 코드예요: " + code, HttpStatus.BAD_REQUEST));

        if (!coupon.isCurrentlyValid()) {
            log.info("쿠폰 발급 스킵 - 유효기간 아님 (code={}, userId={})", code, userId);
            return;
        }
        if (userCouponRepository.existsByUserIdAndCouponId(userId, coupon.getId())) {
            return; // 이미 발급받음 — 중복 지급하지 않고 조용히 무시
        }
        userCouponRepository.save(
                UserCoupon.builder()
                        .userId(userId)
                        .couponId(coupon.getId())
                        .expiresAt(coupon.getValidUntil())
                        .build()
        );
    }
}
