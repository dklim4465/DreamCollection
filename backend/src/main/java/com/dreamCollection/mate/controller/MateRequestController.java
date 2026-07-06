package com.dreamCollection.mate.controller;


import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.mate.dto.MateRequestDecisionRequestDTO;
import com.dreamCollection.mate.dto.MateRequestResponseDTO;
import com.dreamCollection.mate.service.MateRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MateRequestController {

    private final MateRequestService mateRequestService;

    @PostMapping("/api/mate/posts/{matePostId}/requests")
    public ApiResponse<MateRequestResponseDTO> applyForMate(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long matePostId
    ){
        MateRequestResponseDTO responseDTO = mateRequestService.applyForMate(userId, matePostId);
        return ApiResponse.ok(responseDTO, "메이트 신청이 완료되었습니다.");
    }

    @GetMapping("/api/mate/posts/{matePostId}/requests")
    public ApiResponse<List<MateRequestResponseDTO>> getRequestList(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long matePostId
    ){
        return ApiResponse.ok(mateRequestService.getRequestList(userId, matePostId));
    }

    @PatchMapping("api/mate/posts/{matePostId}/requests/{requestId}")
    public ApiResponse<MateRequestResponseDTO> decideRequest(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long matePostId,
            @PathVariable Long requestId,
            @Valid @RequestBody MateRequestDecisionRequestDTO requestDTO
    ){
        MateRequestResponseDTO responseDTO = mateRequestService.decideRequest(userId, matePostId, requestId, requestDTO);
        String message = "ACCEPT".equals(requestDTO.getDecision())? "신청을 수락했습니다.":"신청을 거절했습니다.";
        return ApiResponse.ok(responseDTO,message);
    }

    @GetMapping("/api/mate/requests/me")
    public ApiResponse<List<MateRequestResponseDTO>> getMyRequests(
            @RequestHeader("X-User-Id") Long userId
    ){
        return ApiResponse.ok(mateRequestService.getMyRequests(userId));
    }
}