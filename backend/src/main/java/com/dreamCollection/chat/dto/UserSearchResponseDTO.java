package com.dreamCollection.chat.dto;

public record UserSearchResponseDTO(
    Long userId,
    String nickname,
    String profileImageUrl,
    String friendStatus){
}
