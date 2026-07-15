package com.dreamCollection.chatbot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/**
 * 챗봇 대화 메시지 하나.
 * role: "user"(사용자가 보낸 메시지) | "assistant"(챗봇이 보낸 메시지)
 */
public record ChatMessageDto(
        @NotBlank
        @Pattern(regexp = "user|assistant", message = "role은 user 또는 assistant여야 합니다")
        String role,

        @NotBlank(message = "메시지 내용을 입력해주세요")
        String content
) {
}
