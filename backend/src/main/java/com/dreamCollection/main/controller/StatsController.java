package com.dreamCollection.main.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.main.dto.StatsResponse;
import com.dreamCollection.main.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 프론트: statsApi.getStats() → GET /api/stats
 * 홈 화면 "숫자로 보는 Dream Collection" 섹션용 실제 집계치.
 * 비로그인 사용자도 볼 수 있어야 하므로 공개 API (SecurityConfig PUBLIC_URLS 참고).
 */
@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping
    public ApiResponse<StatsResponse> getStats() {
        return ApiResponse.ok(statsService.getStats(), "조회되었습니다.");
    }
}
