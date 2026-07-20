package com.dreamCollection.admin.controller;

import com.dreamCollection.feedback.dto.FeedbackAdminResponse;
import com.dreamCollection.feedback.entity.Feedback;
import com.dreamCollection.feedback.repository.FeedbackRepository;
import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

// 이 컨트롤러 전체는 SecurityConfig에서 /api/admin/** → hasRole("ADMIN")으로 보호됨
@RestController
@RequestMapping("/api/admin/feedback")
@RequiredArgsConstructor
public class AdminFeedbackController {

    private final FeedbackRepository feedbackRepository;

    @GetMapping
    public ApiResponse<PageResponse<FeedbackAdminResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<FeedbackAdminResponse> result = feedbackRepository
                .findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(FeedbackAdminResponse::from);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @PatchMapping("/{id}/check")
    @Transactional
    public ApiResponse<Void> markChecked(@PathVariable Long id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new BusinessException("문의를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));
        feedback.markChecked();
        return ApiResponse.ok(null, "확인 처리했습니다.");
    }
}
