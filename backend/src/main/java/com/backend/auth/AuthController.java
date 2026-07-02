package com.backend.auth;

import com.backend.user.UserService;
import com.backend.user.dto.AuthResponse;
import com.backend.user.dto.LoginRequest;
import com.backend.user.dto.SignupRequest;
import com.backend.global.response.ApiResponse;
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

    // ?„ë¡ ?? authApi.register() ??POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = userService.signup(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(response, "?Œì›ê°€?…ì´ ?„ë£Œ?˜ì—ˆ?µë‹ˆ??"));
    }

    // ?„ë¡ ?? authApi.login() ??POST /api/auth/login
    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ApiResponse.ok(response, "ë¡œê·¸?¸ë˜?ˆìŠµ?ˆë‹¤.");
    }

    // TODO: ?Œì…œë¡œê·¸??/oauth/{provider}), refresh, logout ?€ ?¤ìŒ ?œì„œë¡?ì¶”ê?
}
