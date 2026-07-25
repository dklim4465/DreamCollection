package com.dreamCollection.admin.controller;

import com.dreamCollection.feedback.dto.FeedbackAdminResponse;
import com.dreamCollection.feedback.dto.FeedbackAnswerRequest;
import com.dreamCollection.feedback.entity.Feedback;
import com.dreamCollection.feedback.repository.FeedbackRepository;
import com.dreamCollection.feedback.service.FeedbackService;
import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.global.response.PageResponse;
import jakarta.validation.Valid;
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
    private final FeedbackService feedbackService;

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

    /**
     * 답변 등록. 답변을 저장하고, 문의자 이메일로 발송하고,
     * 로그인 상태로 접수된 문의였다면 그 회원의 "편지함"에도 편지를 남긴다.
     */
    @PatchMapping("/{id}/answer")
    public ApiResponse<Void> answer(
            @PathVariable Long id,
            @Valid @RequestBody FeedbackAnswerRequest request
    ) {
        feedbackService.answer(id, request.answer());
        return ApiResponse.ok(null, "답변을 보냈어요.");
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new BusinessException("문의를 찾을 수 없습니다.", HttpStatus.NOT_FOUND);
        }
        feedbackRepository.deleteById(id);
        return ApiResponse.ok(null, "문의를 삭제했어요.");
    }
}
