package com.dreamCollection.chat.controller;

import com.dreamCollection.chat.dto.ChatMessageResponseDTO;
import com.dreamCollection.chat.dto.ChatRoomResponseDTO;
import com.dreamCollection.chat.service.ChatService;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping("/mate-posts/{matePostId}/room")
    public ApiResponse<Long> openRoom(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long matePostId
    ) {
        Long roomId = chatService.getOrCreateRoom(matePostId, userId);
        return ApiResponse.ok(roomId, "채팅방이 준비되었습니다.");
    }

    @GetMapping("/rooms")
    public ApiResponse<List<ChatRoomResponseDTO>> getMyRooms(
            @RequestHeader("X-User-Id") Long userId
    ) {
        return ApiResponse.ok(chatService.getMyRooms(userId));
    }

    @GetMapping("/rooms/{roomId}/messages")
    public ApiResponse<List<ChatMessageResponseDTO>> getMessages(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long roomId
    ) {
        return ApiResponse.ok(chatService.getMessages(roomId, userId));
    }

    @PostMapping("/rooms/{roomId}/read")
    public ApiResponse<Void> markRead(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long roomId
    ) {
        chatService.markRead(roomId, userId);
        return ApiResponse.ok(null, "읽음 처리되었습니다.");
    }
}