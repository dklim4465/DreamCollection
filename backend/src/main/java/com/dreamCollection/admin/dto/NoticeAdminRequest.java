package com.dreamCollection.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record NoticeAdminRequest(
        @NotBlank(message = "제목을 입력해주세요") String title,
        @NotBlank(message = "내용을 입력해주세요") String content,
        // 값이 있으면 "쿠폰 지급형" 공지가 된다 — coupon.code와 일치해야 함 (예: WELCOME10). 없으면 null.
        String couponCode,
        Boolean pinned,
        Boolean active
) {
}
