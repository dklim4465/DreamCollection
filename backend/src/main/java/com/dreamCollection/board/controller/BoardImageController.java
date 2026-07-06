package com.dreamCollection.board.controller;


import com.dreamCollection.board.dto.BoardImageCreateRequestDTO;
import com.dreamCollection.board.dto.BoardImageResponseDTO;
import com.dreamCollection.board.service.BoardImageService;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board/posts/{postId}/images")
@RequiredArgsConstructor
public class BoardImageController {

    private final BoardImageService boardImageService;

    @PostMapping
    public ResponseEntity<ApiResponse<BoardImageResponseDTO>> addImage(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long postId,
            @Valid @RequestBody BoardImageCreateRequestDTO requestDTO
            ){
        BoardImageResponseDTO responseDTO = boardImageService.addImage(userId, postId, requestDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDTO,"이미지가 등록되었습니다."));
}

@GetMapping
public ApiResponse<List<BoardImageResponseDTO>> getImage(@PathVariable Long postId){
    return ApiResponse.ok(boardImageService.getImages(postId));
    }

    @DeleteMapping("/{imageId}")
    public ApiResponse<Void> deleteImage(
            @RequestHeader ("X-User-Id") Long userId,
            @PathVariable Long postId,
            @PathVariable Long imageId
    ){
        boardImageService.deleteImage(userId, postId, imageId);
        return ApiResponse.ok(null,"이미지가 삭제되었습니다.");
    }
}
