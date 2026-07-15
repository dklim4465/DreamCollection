package com.dreamCollection.user.controller;

import com.dreamCollection.global.upload.FileStorageService;
import com.dreamCollection.user.dto.ChangePasswordRequest;
import com.dreamCollection.user.dto.DeviceSessionResponse;
import com.dreamCollection.user.dto.LoginHistoryResponse;
import com.dreamCollection.user.dto.UpdateProfileRequest;
import com.dreamCollection.user.dto.UserResponse;
import com.dreamCollection.level.dto.LevelResponse;
import com.dreamCollection.level.service.LevelService;
import com.dreamCollection.global.exception.InvalidCredentialsException;
import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.user.service.DeviceSessionService;
import com.dreamCollection.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final LevelService levelService;
    private final DeviceSessionService deviceSessionService;
    private final FileStorageService fileStorageService;

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

    // 마이페이지 "프로필 수정" (닉네임/이미지URL/여행스타일) → PATCH /api/users/me
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

    // 마이페이지 "프로필 사진 변경" (파일 업로드, 자동 512px 리사이즈) → POST /api/users/me/profile-image
    @PostMapping("/me/profile-image")
    public ApiResponse<UserResponse> uploadProfileImage(
            Authentication authentication,
            @RequestParam("file") MultipartFile file
    ) {
        Long userId = resolveUserId(authentication);
        String url = fileStorageService.storeProfileImage(file);
        UserResponse response = userService.updateProfile(userId, null, url, null);
        return ApiResponse.ok(response, "프로필 사진이 변경되었습니다.");
    }

    // 마이페이지 "비밀번호 변경" (현재 비밀번호 확인 후 변경) → PATCH /api/users/me/password
    @PatchMapping("/me/password")
    public ApiResponse<Void> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        Long userId = resolveUserId(authentication);
        userService.changeMyPassword(userId, request.currentPassword(), request.newPassword());
        return ApiResponse.ok(null, "비밀번호가 변경되었습니다. 다른 기기는 모두 로그아웃 처리됐어요.");
    }

    // 마이페이지 "최근 로그인 기록" → GET /api/users/me/login-history
    @GetMapping("/me/login-history")
    public ApiResponse<List<LoginHistoryResponse>> getLoginHistory(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return ApiResponse.ok(deviceSessionService.getLoginHistory(userId));
    }

    // 마이페이지 "로그인된 기기 목록" → GET /api/users/me/devices
    @GetMapping("/me/devices")
    public ApiResponse<List<DeviceSessionResponse>> getMyDevices(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        return ApiResponse.ok(deviceSessionService.getMyDevices(userId));
    }

    // 마이페이지 "이 기기 로그아웃" → DELETE /api/users/me/devices/{deviceId}
    @DeleteMapping("/me/devices/{deviceId}")
    public ApiResponse<Void> revokeDevice(Authentication authentication, @PathVariable Long deviceId) {
        Long userId = resolveUserId(authentication);
        deviceSessionService.revokeDevice(userId, deviceId);
        return ApiResponse.ok(null, "해당 기기에서 로그아웃되었습니다.");
    }

    // 마이페이지 "모든 기기에서 로그아웃" → DELETE /api/users/me/devices
    @DeleteMapping("/me/devices")
    public ApiResponse<Void> revokeAllDevices(Authentication authentication) {
        Long userId = resolveUserId(authentication);
        deviceSessionService.revokeAllDevices(userId);
        return ApiResponse.ok(null, "모든 기기에서 로그아웃되었습니다.");
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Long userId)) {
            throw new InvalidCredentialsException();
        }
        return userId;
    }
}