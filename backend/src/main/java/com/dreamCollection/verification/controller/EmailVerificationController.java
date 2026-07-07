package com.dreamCollection.verification.controller;

import com.dreamCollection.verification.dto.SendEmailCodeRequest;
import com.dreamCollection.verification.dto.VerifyEmailCodeRequest;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.dreamCollection.verification.service.EmailVerificationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/email")
@RequiredArgsConstructor
public class EmailVerificationController {

    private final EmailVerificationService emailVerificationService;

    // POST /api/auth/email/send-code
    @PostMapping("/send-code")
    public ApiResponse<Void> sendCode(@Valid @RequestBody SendEmailCodeRequest request) {
        emailVerificationService.sendCode(request.email(), request.purpose());
        return ApiResponse.ok(null, "인증번호가 이메일로 발송되었습니다.");
    }

    // POST /api/auth/email/verify-code
    @PostMapping("/verify-code")
    public ApiResponse<Void> verifyCode(@Valid @RequestBody VerifyEmailCodeRequest request) {
        emailVerificationService.verifyCode(request.email(), request.code());
        return ApiResponse.ok(null, "이메일 인증이 완료되었습니다.");
    }
}
