package com.dreamCollection.mate.controller;



import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.mate.dto.MateScheduleLinkCreateRequestDTO;
import com.dreamCollection.mate.repository.MateScheduleLinkResponseDTO;
import com.dreamCollection.mate.service.MateScheduleLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mate/posts/{matePostId}/schedule-links")
@RequiredArgsConstructor
public class MateScheduleLinkController {

    private final MateScheduleLinkService mateScheduleLinkService;

    @PostMapping
    public ResponseEntity<ApiResponse<MateScheduleLinkResponseDTO>> createLink(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long matePostId,
            @Valid @RequestBody MateScheduleLinkCreateRequestDTO requestDTO
            ){
        MateScheduleLinkResponseDTO responseDTO = mateScheduleLinkService.createLink(userId,matePostId,requestDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDTO,"일정이 연동되었습니다."));
    }

    @GetMapping
    public ApiResponse<List<MateScheduleLinkResponseDTO>> getLinks(@PathVariable Long matePostId){
        return ApiResponse.ok(mateScheduleLinkService.getLinks(matePostId));
    }

    @DeleteMapping("/{linkId}")
    public ApiResponse<Void> deleteLink(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long matePostId,
            @PathVariable Long linkId
    ){
        mateScheduleLinkService.deleteLink(userId, matePostId, linkId);
        return ApiResponse.ok(null,"일정 연동이 해제되었습니다.");
    }
}
