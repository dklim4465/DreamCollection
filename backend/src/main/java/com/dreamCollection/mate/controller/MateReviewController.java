package com.dreamCollection.mate.controller;


import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.mate.dto.MateReviewCreateRequestDTO;
import com.dreamCollection.mate.dto.MateReviewResponseDTO;
import com.dreamCollection.mate.service.MateReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mate/reviews")
@RequiredArgsConstructor
public class MateReviewController {

    private final MateReviewService mateReviewService;

    @PostMapping
    public ResponseEntity<ApiResponse<MateReviewResponseDTO>> createReview(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody MateReviewCreateRequestDTO requestDTO
            ){
        MateReviewResponseDTO responseDTO = mateReviewService.createReview(userId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(responseDTO,"후기가 등록되었습니다."));

    }

    @GetMapping("/users/{userId}")
    public ApiResponse<List<MateReviewResponseDTO>> getReviewsForUser(@PathVariable Long userId){
        return ApiResponse.ok(mateReviewService.getReviewsForUser(userId));
    }
}
