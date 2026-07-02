package com.backend.verification.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyCodeRequest(
        @NotBlank(message = "?„í™”ë²ˆí˜¸ë¥??…ë ¥?´ì£¼?¸ìš”")
        String phone,

        @NotBlank(message = "?¸ì¦ë²ˆí˜¸ë¥??…ë ¥?´ì£¼?¸ìš”")
        String code
) {
}
