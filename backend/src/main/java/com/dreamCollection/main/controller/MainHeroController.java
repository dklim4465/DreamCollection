package com.dreamCollection.main.controller;

import com.dreamCollection.main.dto.MainHeroResponse;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dreamCollection.main.service.MainHeroService;

@RestController
@RequestMapping("/api/main")
@RequiredArgsConstructor
public class MainHeroController {

    private final MainHeroService mainHeroService;

    // GET /api/main/background — 비로그인도 호출 가능 (SecurityConfig에서 public 처리됨)
    @GetMapping("/background")
    public ApiResponse<MainHeroResponse> getBackground(Authentication authentication) {
        Long userId = extractUserId(authentication);
        return ApiResponse.ok(mainHeroService.getHero(userId));
    }

    // 토큰이 없으면 principal이 "anonymousUser"(String)이거나 authentication 자체가 null일 수 있음
    private Long extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        return (principal instanceof Long) ? (Long) principal : null;
    }
}
