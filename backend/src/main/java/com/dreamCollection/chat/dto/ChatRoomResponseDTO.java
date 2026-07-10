package com.dreamCollection.chat.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ChatRoomResponseDTO(
        Long roomId,
        Long matePostId,
        List<Long> memberIds,
        String lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount
) {
}