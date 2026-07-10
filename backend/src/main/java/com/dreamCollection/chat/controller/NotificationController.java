package com.dreamCollection.chat.controller;

import com.dreamCollection.chat.dto.NotificationResponseDTO;
import com.dreamCollection.chat.exception.NotificationNotFoundException;
import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.social.entity.Notification;
import com.dreamCollection.social.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping
    public ApiResponse<Page<NotificationResponseDTO>> getMyNotifications(
            @RequestHeader("X-User-Id") Long userId,
            Pageable pageable
    ) {
        Page<NotificationResponseDTO> result = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(NotificationResponseDTO::from);
        return ApiResponse.ok(result);
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ApiResponse.ok(notificationRepository.countByUserIdAndReadFalse(userId));
    }

    @Transactional
    @PostMapping("/{notificationId}/read")
    public ApiResponse<Void> markRead(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long notificationId
    ) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(NotificationNotFoundException::new);

        if (!notification.getUserId().equals(userId)) {
            throw new NotificationNotFoundException();
        }

        notification.markRead();
        return ApiResponse.ok(null, "읽음 처리되었습니다.");
    }
}