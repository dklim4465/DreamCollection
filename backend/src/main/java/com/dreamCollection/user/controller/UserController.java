package com.dreamCollection.user.controller;

import com.dreamCollection.user.dto.UpdateProfileRequest;
import com.dreamCollection.user.dto.UserResponse;
import com.dreamCollection.level.dto.LevelResponse;
import com.dreamCollection.level.service.LevelService;
import com.dreamCollection.global.exception.InvalidCredentialsException;
import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final LevelService levelService;

    // 프론트: authApi.getMe() → GET /api/users/me (로그인 필요)
    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        UserResponse response = userService.getMe(userId);
        if (response == null) throw new InvalidCredentialsException();
        return ApiResponse.ok(response);
    }

    // 마이페이지 "레벨 시스템" → GET /api/users/me/level
    @GetMapping("/me/level")
    public ApiResponse<LevelResponse> getMyLevel(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return ApiResponse.ok(levelService.getMyLevel(userId));
    }

    // 마이페이지 "프로필 수정" → PATCH /api/users/me
    @PatchMapping("/me")
    public ApiResponse<UserResponse> updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        Long userId = resolveUserId(authentication);
        UserResponse response = userService.updateProfile(
                userId, request.nickname(), request.profileImageUrl(), request.travelStyle());
        return ApiResponse.ok(response, "프로필이 수정되었습니다.");
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new InvalidCredentialsException();
        }
        return userId;
    }
}