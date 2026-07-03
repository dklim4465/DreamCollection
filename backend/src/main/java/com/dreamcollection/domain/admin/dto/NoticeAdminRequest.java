package com.dreamcollection.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record NoticeAdminRequest(
        @NotBlank(message = "제목을 입력해주세요") String title,
        @NotBlank(message = "내용을 입력해주세요") String content,
        Boolean pinned,
        Boolean active
) {
}
