package com.dreamCollection.chat.dto;

import java.time.LocalDateTime;

public record FriendRequestResponseDTO(
        Long requestId,
        Long userId,
        String nickname,
        String profileImageUrl,
        LocalDateTime createdAt
) {
}