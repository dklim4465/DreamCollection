package com.dreamCollection.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record MonthlyDestinationAdminRequest(
        @NotBlank(message = "노출 연월을 입력해주세요 (예: 2026-07)") String displayMonth,
        @NotBlank(message = "여행지명을 입력해주세요") String destinationName,
        @NotBlank(message = "제목을 입력해주세요") String title,
        String description,
        @NotBlank(message = "이미지 URL을 입력해주세요") String imageUrl,
        String linkUrl,
        Integer displayOrder,
        Boolean active
) {
}
