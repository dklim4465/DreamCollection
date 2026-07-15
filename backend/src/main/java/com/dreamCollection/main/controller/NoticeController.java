package com.dreamCollection.main.controller;

import com.dreamCollection.main.dto.NoticeResponse;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.dreamCollection.main.service.NoticeService;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<List<NoticeResponse>> getNotices() {
        return ApiResponse.ok(noticeService.getActiveNotices());
    }

    // 공지 상세 — 회원/비회원 누구나 조회 가능 (작성/수정/삭제는 /api/admin/notices에서 관리자만)
    @GetMapping("/{id}")
    public ApiResponse<NoticeResponse> getNoticeDetail(@PathVariable Long id) {
        return ApiResponse.ok(noticeService.getActiveNoticeDetail(id));
    }
}
