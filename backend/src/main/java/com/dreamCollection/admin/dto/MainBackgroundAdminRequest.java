package com.dreamCollection.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record MainBackgroundAdminRequest(
        String mediaType, // "IMAGE" | "VIDEO"
        @NotBlank(message = "미디어 URL을 입력해주세요") String mediaUrl,
        Boolean active
) {
}
