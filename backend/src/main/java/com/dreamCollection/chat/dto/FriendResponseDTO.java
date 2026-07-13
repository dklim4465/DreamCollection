package com.dreamCollection.chat.dto;

public record FriendResponseDTO(
        Long friendshupId,
        Long userId,
        String nickname,
        String profileImageUrl
) {
}
