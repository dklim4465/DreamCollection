package com.dreamCollection.feedback.dto;

import com.dreamCollection.feedback.entity.Feedback;

import java.time.LocalDateTime;

public record FeedbackAdminResponse(
        Long id,
        String name,
        String email,
        String category,
        String message,
        boolean checked,
        LocalDateTime createdAt
) {
    public static FeedbackAdminResponse from(Feedback f) {
        return new FeedbackAdminResponse(
                f.getId(), f.getName(), f.getEmail(), f.getCategory(),
                f.getMessage(), f.isChecked(), f.getCreatedAt()
        );
    }
}
