package com.dreamcollection.domain.user.controller;

import com.dreamcollection.domain.user.dto.UserResponse;
import com.dreamcollection.global.exception.InvalidCredentialsException;
import com.dreamcollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.dreamcollection.domain.user.entity.User;
import com.dreamcollection.domain.user.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    // 프론트: authApi.getMe() → GET /api/users/me (로그인 필요)
    @GetMapping("/me")
    public ApiResponse<UserResponse> getMe(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userRepository.findById(userId)
                .orElseThrow(InvalidCredentialsException::new);
        return ApiResponse.ok(UserResponse.from(user));
    }
}