package com.dreamcollection.domain.user.dto;

import com.dreamcollection.domain.user.TravelStyle;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 요청
 * 프론트 RegisterPage.tsx의 RegisterReq와 필드 1:1 매칭
 *
 * 주의: cardNumber/cardExpiry/cardCvc는 프론트에서 함께 보내지만
 *      PCI-DSS 규정상 카드 원본 정보는 절대 저장하지 않는다.
 *      (실제 결제 연동 시 PG사가 발급하는 billing_key만 user_payment_cards에 저장)
 */
public record SignupRequest(

        @NotBlank(message = "이메일을 입력해주세요")
        @Email(message = "이메일 형식이 올바르지 않습니다")
        String email,

        @NotBlank(message = "비밀번호를 입력해주세요")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 합니다")
        String password,

        @NotBlank(message = "이름을 입력해주세요")
        String name,

        @NotBlank(message = "닉네임을 입력해주세요")
        @Size(max = 30, message = "닉네임은 30자 이내여야 합니다")
        String nickname,

        @NotBlank(message = "전화번호를 입력해주세요")
        String phone,

        // 휴대폰 인증 완료 여부 확인용 (PhoneVerification 조회 키)
        String phoneVerificationCode,

        TravelStyle travelStyle,

        // 아래 3개는 저장하지 않음 — 존재해도 서비스 로직에서 무시
        String cardNumber,
        String cardExpiry,
        String cardCvc
) {
}
