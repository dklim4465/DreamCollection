package com.dreamCollection.feedback.controller;

import com.dreamCollection.feedback.dto.FeedbackRequest;
import com.dreamCollection.feedback.service.FeedbackService;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 프론트: feedbackApi.submit(...) → POST /api/feedback
 * 로그인 여부와 무관하게 누구나 호출 가능 (SecurityConfig PUBLIC_URLS 참고).
 * 단, 로그인한 상태로 보내면 JwtAuthenticationFilter가 토큰을 해석해 userId를 채워주므로
 * (public 엔드포인트라도 토큰이 있으면 인증 정보가 세팅됨) 나중에 관리자가 답변할 때
 * 그 회원의 "편지함"으로 답장을 보낼 수 있다. 비로그인 방문자는 userId가 null로 들어간다.
 */
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ApiResponse<Void> submit(
            @Valid @RequestBody FeedbackRequest request,
            @AuthenticationPrincipal Long userId
    ) {
        feedbackService.submit(request, userId);
        return ApiResponse.ok(null, "문의가 접수되었습니다. 빠르게 확인할게요!");
    }
}
