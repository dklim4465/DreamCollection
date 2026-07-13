package com.dreamCollection.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 마이페이지 "비밀번호 변경" (로그인된 상태, 현재 비밀번호 확인 후 변경).
 * 프론트: profileApi.changePassword() → PATCH /api/users/me/password
 */
public record ChangePasswordRequest(
        @NotBlank(message = "현재 비밀번호를 입력해주세요")
        String currentPassword,

        @NotBlank(message = "새 비밀번호를 입력해주세요")
        @Size(min = 8, message = "비밀번호는 8자 이상이어야 해요")
        String newPassword
) {
}