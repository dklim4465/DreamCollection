package com.dreamcollection.domain.auth.controller;

import com.dreamcollection.domain.user.service.UserService;
import com.dreamcollection.domain.user.dto.AuthResponse;
import com.dreamcollection.domain.user.dto.KakaoLoginRequest;
import com.dreamcollection.domain.user.dto.LoginRequest;
import com.dreamcollection.domain.user.dto.RefreshTokenRequest;
import com.dreamcollection.domain.user.dto.SignupRequest;
import com.dreamcollection.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // 프론트: authApi.register() → POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(
            @Valid @RequestBody SignupRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthResponse response = userService.signup(request, userAgent(httpRequest), clientIp(httpRequest));
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "회원가입이 완료되었습니다."));
    }

    // 프론트: authApi.login() → POST /api/auth/login
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthResponse response = userService.login(request, userAgent(httpRequest), clientIp(httpRequest));
        return ApiResponse.ok(response, "로그인되었습니다.");
    }

    // Access Token 만료 시, Refresh Token으로 재발급 → POST /api/auth/refresh
    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(
            @Valid @RequestBody RefreshTokenRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthResponse response = userService.refresh(
                request.refreshToken(), userAgent(httpRequest), clientIp(httpRequest));
        return ApiResponse.ok(response, "토큰이 재발급되었습니다.");
    }

    // 로그아웃: 전달받은 Refresh Token 폐기 → POST /api/auth/logout
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@Valid @RequestBody RefreshTokenRequest request) {
        userService.logout(request.refreshToken());
        return ApiResponse.ok(null, "로그아웃되었습니다.");
    }

    // 카카오 로그인: 프론트가 카카오에서 받은 인가 코드(code)를 전달 → POST /api/auth/oauth/kakao
    @PostMapping("/oauth/kakao")
    public ApiResponse<AuthResponse> kakaoLogin(
            @Valid @RequestBody KakaoLoginRequest request,
            HttpServletRequest httpRequest
    ) {
        AuthResponse response = userService.kakaoLogin(request, userAgent(httpRequest), clientIp(httpRequest));
        return ApiResponse.ok(response, "카카오 로그인되었습니다.");
    }

    private String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        return (forwarded != null && !forwarded.isBlank()) ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
    }
}
