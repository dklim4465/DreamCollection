package com.backend.user.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * ?„ë¡ ??LoginReq?€ ?„ë“œ ë§¤ì¹­ (email, password)
 */
public record LoginRequest(
        @NotBlank(message = "?´ë©”?¼ì„ ?…ë ¥?´ì£¼?¸ìš”")
        String email,

        @NotBlank(message = "ë¹„ë?ë²ˆí˜¸ë¥??…ë ¥?´ì£¼?¸ìš”")
        String password
) {
}
