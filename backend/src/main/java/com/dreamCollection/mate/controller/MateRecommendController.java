package com.dreamCollection.mate.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.mate.dto.MateRecommendResponseDTO;
import com.dreamCollection.mate.service.MateAiRecommendService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/mate/recommend")
@RequiredArgsConstructor
public class MateRecommendController {

    private final MateAiRecommendService mateAiRecommendService;

    @GetMapping
    public ApiResponse<MateRecommendResponseDTO> recommend(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(mateAiRecommendService.recommend(userId));
    }
}