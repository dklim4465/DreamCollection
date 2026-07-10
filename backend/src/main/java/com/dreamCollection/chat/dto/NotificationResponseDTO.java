package com.dreamCollection.chat.dto;

import com.dreamCollection.social.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponseDTO(
        Long id,
        String type,
        String targetType,
        Long targetId,
        String content,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponseDTO from(Notification notification) {
        return new NotificationResponseDTO(
                notification.getId(),
                notification.getType(),
                notification.getTargetType(),
                notification.getTargetId(),
                notification.getContent(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}