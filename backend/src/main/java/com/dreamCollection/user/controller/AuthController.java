package com.dreamCollection.user.controller;

import com.dreamCollection.user.service.UserService;
import com.dreamCollection.user.dto.AuthResponse;
import com.dreamCollection.user.dto.AvailabilityResponse;
import com.dreamCollection.user.dto.KakaoLoginRequest;
import com.dreamCollection.user.dto.LoginRequest;
import com.dreamCollection.user.dto.RefreshTokenRequest;
import com.dreamCollection.user.dto.SignupRequest;
import com.dreamCollection.user.dto.UserResponse;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    // 새로고침 후 유저 정보 복구: 프론트 authApi.getMe() → GET /api/auth/me
    // (/api/auth/**가 SecurityConfig에서 permitAll이라 토큰 없어도 호출은 되지만,
    //  JwtAuthenticationFilter가 유효한 토큰일 때만 principal을 채워주므로
    //  토큰이 없거나 만료됐으면 그냥 user: null로 응답한다.)
    @GetMapping("/me")
    public ApiResponse<UserResponse> me(Authentication authentication) {
        Long userId = (authentication != null && authentication.getPrincipal() instanceof Long id)
                ? id
                : null;
        UserResponse response = userService.getMe(userId);
        return ApiResponse.ok(response, response != null ? "조회되었습니다." : "로그인 정보가 없습니다.");
    }

    // 회원가입창 "이메일 중복확인" 버튼 → GET /api/auth/check-email?email=...
    @GetMapping("/check-email")
    public ApiResponse<AvailabilityResponse> checkEmail(@RequestParam String email) {
        boolean available = userService.isEmailAvailable(email);
        return ApiResponse.ok(
                AvailabilityResponse.of(available),
                available ? "사용 가능한 이메일입니다." : "이미 가입된 이메일입니다."
        );
    }

    // 회원가입창 "휴대폰 중복확인" 버튼 → GET /api/auth/check-phone?phone=...
    @GetMapping("/check-phone")
    public ApiResponse<AvailabilityResponse> checkPhone(@RequestParam String phone) {
        boolean available = userService.isPhoneAvailable(phone);
        return ApiResponse.ok(
                AvailabilityResponse.of(available),
                available ? "사용 가능한 휴대폰 번호입니다." : "이미 가입된 휴대폰 번호입니다."
        );
    }

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
