package com.dreamCollection.chatbot.controller;

import com.dreamCollection.chatbot.client.GeminiChatClient;
import com.dreamCollection.chatbot.dto.ChatRequest;
import com.dreamCollection.chatbot.dto.ChatResponse;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 홈페이지 "AI 여행 챗봇".
 * 프론트: chatbotApi.sendMessage(messages) → POST /api/chatbot/message
 * PUBLIC_URLS에 없으므로 로그인(JWT) 사용자만 호출 가능 (비로그인 남용 방지).
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final GeminiChatClient geminiChatClient;

    @PostMapping("/message")
    public ApiResponse<ChatResponse> sendMessage(@Valid @RequestBody ChatRequest request) {
        String reply = geminiChatClient.chat(request.messages());
        return ApiResponse.ok(new ChatResponse(reply));
    }
}
