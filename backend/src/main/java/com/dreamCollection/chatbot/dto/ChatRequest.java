package com.dreamCollection.chatbot.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

/**
 * 프론트: chatbotApi.sendMessage(messages) → POST /api/chatbot/message
 * 매번 지금까지의 전체 대화(messages)를 통째로 보낸다 (서버는 대화를 저장하지 않는 stateless 방식).
 * 마지막 원소가 이번에 새로 보낸 사용자 메시지.
 */
public record ChatRequest(
        @NotEmpty(message = "메시지가 없습니다")
        @Valid
        List<ChatMessageDto> messages
) {
}
