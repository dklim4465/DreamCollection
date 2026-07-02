package com.dreamcollection.domain.verification.dto;

import com.dreamcollection.domain.verification.EmailVerification;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record SendEmailCodeRequest(
        @NotBlank(message = "이메일을 입력해주세요")
        @Email(message = "이메일 형식이 올바르지 않습니다")
        String email,

        // 회원가입용 인증인지, 비밀번호 찾기용 인증인지 구분 (기본값: SIGNUP)
        EmailVerification.Purpose purpose
) {
}
