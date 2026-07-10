package com.dreamCollection.badge.controller;

import com.dreamCollection.badge.dto.BadgeResponse;
import com.dreamCollection.badge.service.BadgeService;
import com.dreamCollection.global.exception.InvalidCredentialsException;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 프론트: badgeApi.ts
 *  - GET   /api/badges/me                       → 내 뱃지 목록(획득/미획득 전부 + 대표 여부)
 *  - PATCH /api/badges/me/representative/{id}   → 대표 뱃지 지정
 *  - DELETE /api/badges/me/representative       → 대표 뱃지 해제
 * 전부 로그인 필요 (SecurityConfig에서 /api/badges/**는 공개 목록에 없음 = 기본적으로 인증 필요).
 */
@RestController
@RequestMapping("/api/badges")
@RequiredArgsConstructor
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping("/me")
    public ApiResponse<List<BadgeResponse>> getMyBadges(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return ApiResponse.ok(badgeService.getMyBadges(userId));
    }

    @PatchMapping("/me/representative/{badgeId}")
    public ApiResponse<Void> setRepresentative(Authentication authentication, @PathVariable Long badgeId) {
        Long userId = resolveUserId(authentication);
        badgeService.setRepresentative(userId, badgeId);
        return ApiResponse.ok(null, "대표 뱃지가 변경되었습니다.");
    }

    @DeleteMapping("/me/representative")
    public ApiResponse<Void> clearRepresentative(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        badgeService.clearRepresentative(userId);
        return ApiResponse.ok(null, "대표 뱃지가 해제되었습니다.");
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new InvalidCredentialsException();
        }
        return userId;
    }
}
