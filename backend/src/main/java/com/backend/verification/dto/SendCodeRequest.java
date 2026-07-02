package com.backend.verification.dto;

import jakarta.validation.constraints.NotBlank;

public record SendCodeRequest(
        @NotBlank(message = "?„í™”ë²ˆí˜¸ë¥??…ë ¥?´ì£¼?¸ìš”")
        String phone
) {
}
