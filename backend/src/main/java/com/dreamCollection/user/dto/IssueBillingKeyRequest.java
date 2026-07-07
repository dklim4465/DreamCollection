package com.dreamCollection.user.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * 프론트에서 토스페이먼츠 카드 등록 위젯(requestBillingAuth) 완료 후
 * 리다이렉트로 받은 authKey를 그대로 백엔드에 전달.
 * customerKey는 위젯 실행 시 프론트가 "현재 로그인한 사용자 id"로 지정했던 값과
 * 일치해야 하며, 서버는 로그인 세션(JWT)의 userId와 대조해서 검증한다.
 */
public record IssueBillingKeyRequest(
        @NotBlank(message = "authKey가 필요합니다")
        String authKey,

        @NotBlank(message = "customerKey가 필요합니다")
        String customerKey
) {
}