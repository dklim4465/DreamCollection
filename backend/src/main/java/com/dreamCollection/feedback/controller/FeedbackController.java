package com.dreamCollection.feedback.controller;

import com.dreamCollection.feedback.dto.FeedbackRequest;
import com.dreamCollection.feedback.service.FeedbackService;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 프론트: feedbackApi.submit(...) → POST /api/feedback
 * 로그인 여부와 무관하게 누구나 호출 가능 (SecurityConfig PUBLIC_URLS 참고).
 */
@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ApiResponse<Void> submit(@Valid @RequestBody FeedbackRequest request) {
        feedbackService.submit(request);
        return ApiResponse.ok(null, "문의가 접수되었습니다. 빠르게 확인할게요!");
    }
}
