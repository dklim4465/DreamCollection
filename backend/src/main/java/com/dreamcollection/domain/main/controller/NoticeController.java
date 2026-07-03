package com.dreamcollection.domain.main.controller;

import com.dreamcollection.domain.main.dto.NoticeResponse;
import com.dreamcollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.dreamcollection.domain.main.service.NoticeService;

@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<List<NoticeResponse>> getNotices() {
        return ApiResponse.ok(noticeService.getActiveNotices());
    }
}
