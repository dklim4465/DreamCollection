package com.dreamCollection.chat.controller;

import com.dreamCollection.chat.dto.ChatMessageResponseDTO;
import com.dreamCollection.chat.dto.ChatMessageSendRequestDTO;
import com.dreamCollection.chat.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/rooms/{roomId}/send")
    public void send(
            @DestinationVariable Long roomId,
            @Valid @Payload ChatMessageSendRequestDTO request,
            Principal principal
    ) {
        Long senderId = Long.valueOf(principal.getName());
        ChatMessageResponseDTO response = chatService.sendMessage(roomId, senderId, request);

        // @SendTo("/sub/rooms/{roomId}")는 {roomId}를 실제 값으로 치환해주지 않아서
        // 항상 문자 그대로 "/sub/rooms/{roomId}"라는 잘못된 주소로 발행되는 문제가 있었음.
        // 그래서 @SendTo 대신, 실제 roomId 값을 문자열로 직접 조립해서 발행함.
        messagingTemplate.convertAndSend("/sub/rooms/" + roomId, response);
    }
}