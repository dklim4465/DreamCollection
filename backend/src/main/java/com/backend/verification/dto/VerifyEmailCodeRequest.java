package com.backend.verification.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyEmailCodeRequest(
        @NotBlank(message = "?´ë©”?¼ì„ ?…ë ¥?´ì£¼?¸ìš”")
        String email,

        @NotBlank(message = "?¸ì¦ë²ˆí˜¸ë¥??…ë ¥?´ì£¼?¸ìš”")
        String code
) {
}
