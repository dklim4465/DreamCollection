package com.dreamCollection.verification.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.verification.dto.PasswordResetConfirmRequest;
import com.dreamCollection.verification.dto.PasswordResetRequest;
import com.dreamCollection.verification.dto.PasswordResetTokenResponse;
import com.dreamCollection.verification.dto.PasswordResetVerifyRequest;
import com.dreamCollection.verification.service.PasswordResetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 로그인 페이지 "비밀번호를 잊으셨나요?" 흐름.
 * /api/auth/** 는 SecurityConfig의 PUBLIC_URLS에 이미 포함되어 있어 별도 설정 없이 비로그인 접근 가능.
 */
@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    // 1단계: 가입된 이메일로 인증코드 발송 → POST /api/auth/password/request
    @PostMapping("/request")
    public ApiResponse<Void> requestReset(@Valid @RequestBody PasswordResetRequest request) {
        passwordResetService.requestReset(request.email());
        return ApiResponse.ok(null, "인증번호가 이메일로 발송되었습니다.");
    }

    // 2단계: 인증코드 검증 → 성공 시 1회용 resetToken 발급 → POST /api/auth/password/verify
    @PostMapping("/verify")
    public ApiResponse<PasswordResetTokenResponse> verify(@Valid @RequestBody PasswordResetVerifyRequest request) {
        String resetToken = passwordResetService.verifyAndIssueResetToken(request.email(), request.code());
        return ApiResponse.ok(new PasswordResetTokenResponse(resetToken), "본인 확인이 완료되었습니다.");
    }

    // 3단계: resetToken + 새 비밀번호로 최종 변경 → POST /api/auth/password/confirm
    @PostMapping("/confirm")
    public ApiResponse<Void> confirm(@Valid @RequestBody PasswordResetConfirmRequest request) {
        passwordResetService.resetPassword(request.resetToken(), request.newPassword());
        return ApiResponse.ok(null, "비밀번호가 변경되었습니다. 새 비밀번호로 다시 로그인해주세요.");
    }
}
