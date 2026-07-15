package com.dreamCollection.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record BannerAdminRequest(
        @NotBlank(message = "제목을 입력해주세요") String title,
        String mediaType, // "IMAGE" | "VIDEO" — 안 보내면 IMAGE로 처리
        String bannerType, // "POPUP" | "CORNER_AD" — 안 보내면 POPUP으로 처리
        @NotBlank(message = "이미지 URL을 입력해주세요") String imageUrl,
        String linkUrl,
        Integer displayOrder,
        Boolean active
) {
}
