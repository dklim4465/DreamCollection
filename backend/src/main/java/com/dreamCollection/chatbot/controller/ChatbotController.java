package com.dreamCollection.chatbot.controller;

import com.dreamCollection.chatbot.dto.ChatHistoryItem;
import com.dreamCollection.chatbot.dto.ChatRequest;
import com.dreamCollection.chatbot.dto.ChatResponse;
import com.dreamCollection.chatbot.service.ChatbotService;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 홈페이지 "AI 여행 챗봇".
 * 프론트: chatbotApi.sendMessage(messages) → POST /api/chatbot/message
 *        chatbotApi.getHistory()          → GET  /api/chatbot/history (패널 열 때 이전 대화 불러오기)
 * PUBLIC_URLS에 없으므로 로그인(JWT) 사용자만 호출 가능 (비로그인 남용 방지 + 유저별 기록 저장용).
 * (다른 컨트롤러들과 동일하게 @AuthenticationPrincipal Long userId 패턴을 그대로 씀 —
 *  JwtAuthenticationFilter가 인증 principal 자리에 userId(Long)를 직접 넣어두기 때문)
 */
@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    public ApiResponse<ChatResponse> sendMessage(@AuthenticationPrincipal Long userId, @Valid @RequestBody ChatRequest request) {
        String reply = chatbotService.chat(userId, request.messages());
        return ApiResponse.ok(new ChatResponse(reply));
    }

    @GetMapping("/history")
    public ApiResponse<List<ChatHistoryItem>> getHistory(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(chatbotService.getHistory(userId));
    }

    @DeleteMapping("/history")
    public ApiResponse<Void> clearHistory(@AuthenticationPrincipal Long userId) {
        chatbotService.clearHistory(userId);
        return ApiResponse.ok(null, "대화 기록이 삭제되었습니다.");
    }
}
