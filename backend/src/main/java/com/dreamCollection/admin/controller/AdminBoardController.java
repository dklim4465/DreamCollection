package com.dreamCollection.admin.controller;

import com.dreamCollection.board.dto.BoardPostListResponseDTO;
import com.dreamCollection.board.service.BoardPostService;
import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.global.response.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

// 이 컨트롤러 전체는 SecurityConfig에서 /api/admin/** → hasRole("ADMIN")으로 보호됨
@RestController
@RequestMapping("/api/admin/board")
@RequiredArgsConstructor
public class AdminBoardController {

    private final BoardPostService boardPostService;

    @GetMapping("/posts")
    public ApiResponse<PageResponse<BoardPostListResponseDTO>> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<BoardPostListResponseDTO> result = boardPostService.getPostList("ALL", pageable);
        return ApiResponse.ok(PageResponse.from(result));
    }

    @DeleteMapping("/posts/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable Long postId) {
        boardPostService.adminDeletePost(postId);
        return ApiResponse.ok(null, "게시글이 삭제되었습니다.");
    }
}
