package com.dreamCollection.board.controller;

import com.dreamCollection.board.repository.BoardNotificationQueryRepository;
import com.dreamCollection.chat.dto.NotificationResponseDTO;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/board/notifications")
@RequiredArgsConstructor
public class BoardNotificationController {

    private final BoardNotificationQueryRepository boardNotificationQueryRepository;

    private static final int VISIBLE_DAYS_FOR_READ = 7;

    @GetMapping
    public ApiResponse<Page<NotificationResponseDTO>> getVisibleNotifications(
            @AuthenticationPrincipal Long userId,
            Pageable pageable
    ) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(VISIBLE_DAYS_FOR_READ);
        Page<NotificationResponseDTO> result = boardNotificationQueryRepository
                .findVisibleByUserId(userId, cutoff, pageable)
                .map(NotificationResponseDTO::from);
        return ApiResponse.ok(result);
    }
}