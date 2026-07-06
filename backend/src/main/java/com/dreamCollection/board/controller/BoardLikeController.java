package com.dreamCollection.board.controller;


import com.dreamCollection.board.dto.BoardLikeResponseDTO;
import com.dreamCollection.board.service.BoardLikeService;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board/posts/{postId}/likes")
@RequiredArgsConstructor
public class BoardLikeController {

    private final BoardLikeService boardLikeService;

    @PostMapping
    public ApiResponse<BoardLikeResponseDTO> toogleLike(
            @RequestHeader("X-User_Id") Long userId,
            @PathVariable Long postId
    ){
        BoardLikeResponseDTO responseDTO = boardLikeService.toggleLike(userId, postId);
        String message = responseDTO.isLiked()?"좋아요를 눌렀습니다.":"좋아요를 취소했습니다";
        return ApiResponse.ok(responseDTO,message);
    }
}

