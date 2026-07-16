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
 * 이벤트 쿠폰 발급/조회.
 *
 * 가입 시 자동 지급하던 방식에서, 공지사항 글을 열람하고 사용자가 직접
 * [쿠폰받기] 버튼을 눌러야 지급되는 방식으로 바뀌었다.
 *  - notice.coupon_code 컬럼에 쿠폰 코드가 걸려 있으면 그 공지는 "쿠폰 지급형" 공지로 취급되고,
 *    상세 페이지에서 [쿠폰받기]를 누르면 claimCoupon()이 호출된다.
 *  - 예) WELCOME10(신규가입 10%), RETURNING5(기존회원 5%) — 둘 다 동일한 방식으로 지급.
 * 1인 1매만 지급되도록 user_coupon(user_id, coupon_id) 유니크 제약으로 방지.
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

    /**
     * 공지사항의 [쿠폰받기] 버튼을 눌렀을 때 호출.
     * 이미 발급받았거나, 코드가 존재하지 않거나, 유효기간이 아니면 명확한 에러를 던져서
     * 프론트에서 "이미 받은 쿠폰이에요" 같은 안내를 보여줄 수 있게 한다(자동 지급과 달리
     * 사용자가 직접 누른 액션이므로 조용히 무시하지 않는다).
     */
    @Transactional
    public void claimCoupon(Long userId, String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new BusinessException("존재하지 않는 쿠폰 코드예요.", HttpStatus.BAD_REQUEST));

        if (!coupon.isCurrentlyValid()) {
            throw new BusinessException("지금은 받을 수 없는 쿠폰이에요.", HttpStatus.BAD_REQUEST);
        }
        if (userCouponRepository.existsByUserIdAndCouponId(userId, coupon.getId())) {
            throw new BusinessException("이미 받은 쿠폰이에요.", HttpStatus.BAD_REQUEST);
        }

        userCouponRepository.save(
                UserCoupon.builder()
                        .userId(userId)
                        .couponId(coupon.getId())
                        .expiresAt(coupon.getValidUntil())
                        .build()
        );
        log.info("쿠폰 지급 완료 (code={}, userId={})", code, userId);
    }
}
