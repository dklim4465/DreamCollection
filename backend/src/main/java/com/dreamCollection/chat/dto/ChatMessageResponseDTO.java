package com.dreamCollection.chat.dto;

import com.dreamCollection.chat.entity.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageResponseDTO(
        Long messageId,
        Long roomId,
        Long senderId,
        String content,
        String messageType,
        LocalDateTime createdAt
) {
    public static ChatMessageResponseDTO from(ChatMessage message) {
        return new ChatMessageResponseDTO(
                message.getId(),
                message.getRoomId(),
                message.getSenderId(),
                message.getContent(),
                message.getMessageType(),
                message.getSentAt()
        );
    }
}