package com.dreamCollection.letter.dto;

import com.dreamCollection.letter.entity.Letter;

import java.time.LocalDateTime;

public record LetterResponse(
        Long id,
        String type,
        Long sourceId,
        String title,
        String content,
        boolean read,
        LocalDateTime createdAt
) {
    public static LetterResponse from(Letter letter) {
        return new LetterResponse(
                letter.getId(),
                letter.getType(),
                letter.getSourceId(),
                letter.getTitle(),
                letter.getContent(),
                letter.isRead(),
                letter.getCreatedAt()
        );
    }
}
