package com.dreamCollection.board.controller;

import com.dreamCollection.board.dto.BoardPostCreateRequestDTO;
import com.dreamCollection.board.dto.BoardPostDetailResponseDTO;
import com.dreamCollection.board.dto.BoardPostListResponseDTO;
import com.dreamCollection.board.dto.BoardPostUpdateRequestDTO;
import com.dreamCollection.board.service.BoardPostService;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board/posts")
@RequiredArgsConstructor
public class BoardPostController {

    private final BoardPostService boardPostService;

    @PostMapping
    public ResponseEntity<ApiResponse<BoardPostDetailResponseDTO>> createPost(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody BoardPostCreateRequestDTO request
    ) {

        BoardPostDetailResponseDTO responseDTO =
                boardPostService.createPost(userId, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDTO, "게시글이 등록되었습니다."));
    }

    @GetMapping
    public ApiResponse<Page<BoardPostListResponseDTO>> getPostList(
            @RequestParam String category,
            Pageable pageable
    ) {

        Page<BoardPostListResponseDTO> posts =
                boardPostService.getPostList(category, pageable);

        return ApiResponse.ok(posts);
    }

    @GetMapping("/{postId}")
    public ApiResponse<BoardPostDetailResponseDTO> getPostDetail(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long postId
    ) {

        BoardPostDetailResponseDTO response =
                boardPostService.getPostDetail(postId, userId);

        return ApiResponse.ok(response);
    }

    @PutMapping("/{postId}")
    public ApiResponse<BoardPostDetailResponseDTO> updatePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardPostUpdateRequestDTO request
    ) {

        BoardPostDetailResponseDTO response =
                boardPostService.updatePost(userId, postId, request);

        return ApiResponse.ok(response, "게시글이 수정되었습니다.");
    }

    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long postId
    ) {

        boardPostService.deletePost(userId, postId);

        return ApiResponse.ok(null, "게시글이 삭제되었습니다.");
    }
}