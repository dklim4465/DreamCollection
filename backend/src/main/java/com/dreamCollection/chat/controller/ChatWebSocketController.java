package com.dreamCollection.chat.controller;

import com.dreamCollection.chat.dto.ChatMessageResponseDTO;
import com.dreamCollection.chat.dto.ChatMessageSendRequestDTO;
import com.dreamCollection.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/rooms/{roomId}/send")
    @SendTo("/sub/rooms/{roomId}")
    public ChatMessageResponseDTO send(
            @DestinationVariable Long roomId,
            @Valid @Payload ChatMessageSendRequestDTO request,
            Principal principal
    ) {
        Long senderId = Long.valueOf(principal.getName());
        return chatService.sendMessage(roomId, senderId, request);
    }
}