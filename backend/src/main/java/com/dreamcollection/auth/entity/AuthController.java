package com.dreamcollection.domain.auth;

import com.dreamcollection.domain.user.UserService;
import com.dreamcollection.domain.user.dto.AuthResponse;
import com.dreamcollection.domain.user.dto.LoginRequest;
import com.dreamcollection.domain.user.dto.SignupRequest;
import com.dreamcollection.global.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = userService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "회원가입이 완료되었습니다."));
    }

    // 프론트: authApi.login() → POST /api/auth/login
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ApiResponse.ok(response, "로그인되었습니다.");
    }

    // TODO: 소셜로그인(/oauth/{provider}), refresh, logout 은 다음 순서로 추가
}
