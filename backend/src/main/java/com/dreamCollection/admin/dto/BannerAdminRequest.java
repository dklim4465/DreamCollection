package com.dreamCollection.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record BannerAdminRequest(
        @NotBlank(message = "제목을 입력해주세요") String title,
        @NotBlank(message = "이미지 URL을 입력해주세요") String imageUrl,
        String linkUrl,
        Integer displayOrder,
        Boolean active
) {
}
