package com.dreamCollection.board.controller;


import com.dreamCollection.board.dto.BoardCommentCreateRequestDTO;
import com.dreamCollection.board.dto.BoardCommentResponseDTO;
import com.dreamCollection.board.dto.BoardCommentUpdateRequestDTO;
import com.dreamCollection.board.service.BoardCommentService;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board/posts/{postId}/comments")
@RequiredArgsConstructor
public class BoardCommentController {

    private final BoardCommentService boardCommentService;

    @PostMapping
    public ResponseEntity<ApiResponse<BoardCommentResponseDTO>> createComment(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardCommentCreateRequestDTO requestDTO) {
        BoardCommentResponseDTO responseDTO = boardCommentService.createComment(userId, postId, requestDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDTO, "댓글이 등록되었습니다"));
    }
    @GetMapping
    public ApiResponse<List<BoardCommentResponseDTO>> getCommentList(@PathVariable Long postId){
        List<BoardCommentResponseDTO> comments = boardCommentService.getCommentList(postId);
        return ApiResponse.ok(comments);
    }

    @PutMapping("/{commentId}")
    public ApiResponse<BoardCommentResponseDTO> updateComment(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @Valid @RequestBody BoardCommentUpdateRequestDTO requestDTO
    ) {
        BoardCommentResponseDTO responseDTO = boardCommentService.updateComment(userId, postId, commentId, requestDTO);
        return ApiResponse.ok(responseDTO, "댓글이 수정되었습니다.");
    }

            @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @PathVariable Long commentId
    ){
        boardCommentService.deleteComment(userId, postId, commentId);
        return ApiResponse.ok(null,"댓글이 삭제되었습니다.");
    }
}