package com.dreamcollection.domain.verification.controller;

import com.dreamcollection.domain.verification.dto.SendCodeRequest;
import com.dreamcollection.domain.verification.dto.VerifyCodeRequest;
import com.dreamcollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.dreamcollection.domain.verification.service.PhoneVerificationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/phone")
@RequiredArgsConstructor
public class PhoneVerificationController {

    private final PhoneVerificationService phoneVerificationService;

    // 프론트: authApi.sendPhoneCode(phone) → POST /api/auth/phone/send-code
    @PostMapping("/send-code")
    public ApiResponse<Void> sendCode(@Valid @RequestBody SendCodeRequest request) {
        phoneVerificationService.sendCode(request.phone());
        return ApiResponse.ok(null, "인증번호가 발송되었습니다.");
    }

    // 프론트: authApi.verifyPhoneCode(phone, code) → POST /api/auth/phone/verify-code
    @PostMapping("/verify-code")
    public ApiResponse<Void> verifyCode(@Valid @RequestBody VerifyCodeRequest request) {
        phoneVerificationService.verifyCode(request.phone(), request.code());
        return ApiResponse.ok(null, "휴대폰 인증이 완료되었습니다.");
    }
}
