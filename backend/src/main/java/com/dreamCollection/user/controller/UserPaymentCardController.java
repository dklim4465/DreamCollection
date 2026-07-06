package com.dreamCollection.user.controller;

import com.dreamCollection.user.dto.IssueBillingKeyRequest;
import com.dreamCollection.user.dto.PaymentCardResponse;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.dreamCollection.user.service.UserPaymentCardService;
/**
 * 카드 등록은 회원가입 화면이 아니라, 가입 완료 후(로그인 상태) 별도 단계에서 진행합니다.
 * 프론트 흐름: 가입 성공 → "카드 등록하기(선택)" 화면 → 토스 SDK 위젯으로 authKey 발급
 *            → 이 API로 authKey 전달 → 등록 완료
 */
@RestController
@RequestMapping("/api/users/me/payment-cards")
@RequiredArgsConstructor
public class UserPaymentCardController {

    private final UserPaymentCardService userPaymentCardService;

    @PostMapping
    public ApiResponse<PaymentCardResponse> registerCard(
            @Valid @RequestBody IssueBillingKeyRequest request,
            Authentication authentication
    ) {
        Long userId = (Long) authentication.getPrincipal();
        PaymentCardResponse response = userPaymentCardService.registerCard(
                userId, request.authKey(), request.customerKey());
        return ApiResponse.ok(response, "카드가 등록되었습니다.");
    }

    @GetMapping
    public ApiResponse<List<PaymentCardResponse>> getMyCards(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(userPaymentCardService.getMyCards(userId));
    }
}