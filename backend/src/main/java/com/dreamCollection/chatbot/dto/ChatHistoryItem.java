package com.dreamCollection.chatbot.dto;

import com.dreamCollection.chatbot.entity.ChatbotMessage;

import java.time.LocalDateTime;

public record ChatHistoryItem(String role, String content, LocalDateTime createdAt) {
    public static ChatHistoryItem from(ChatbotMessage m) {
        return new ChatHistoryItem(m.getRole(), m.getContent(), m.getCreatedAt());
    }
}
