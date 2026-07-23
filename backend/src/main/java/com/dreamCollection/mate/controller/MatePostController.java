package com.dreamCollection.mate.controller;


import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.mate.dto.MatePostCreateRequestDTO;
import com.dreamCollection.mate.dto.MatePostDetailResponseDTO;
import com.dreamCollection.mate.dto.MatePostListResponseDTO;
import com.dreamCollection.mate.dto.MatePostUpdateRequestDTO;
import com.dreamCollection.mate.service.MatePostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mate/posts")
@RequiredArgsConstructor
public class MatePostController {

    private final MatePostService matePostService;

    @PostMapping
    public ResponseEntity<ApiResponse<MatePostDetailResponseDTO>> createPost(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody MatePostCreateRequestDTO requestDTO
    ){
        MatePostDetailResponseDTO responseDTO = matePostService.createPost(userId, requestDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDTO,"모집글이 등록되었습니다"));
    }

    @GetMapping
    public ApiResponse<Page<MatePostListResponseDTO>> getPostList(
            @RequestParam(defaultValue = "RECRUITING") String status,
            @RequestParam(required = false) String countryCode,
            Pageable pageable
    ){
        return ApiResponse.ok(matePostService.getPostList(status, countryCode, pageable));
    }

    @GetMapping("/{matePostId}")
    public ApiResponse<MatePostDetailResponseDTO> getPostDetail(@PathVariable Long matePostId){
        return ApiResponse.ok(matePostService.getPostDetail(matePostId));
    }

    @PutMapping("/{matePostId}")
    public ApiResponse<MatePostDetailResponseDTO> updatePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long matePostId,
            @Valid @RequestBody MatePostUpdateRequestDTO requestDTO
    ){
        MatePostDetailResponseDTO responseDTO = matePostService.updatePost(userId, matePostId, requestDTO);
        return ApiResponse.ok(responseDTO, "모집글이 수정되었습니다");
    }

    @DeleteMapping("/{matePostId}")
    public ApiResponse<Void> deletePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long matePostId
    ){
        matePostService.deletePost(userId, matePostId);
        return ApiResponse.ok(null, "모집글이 삭제되었습니다");
    }
}