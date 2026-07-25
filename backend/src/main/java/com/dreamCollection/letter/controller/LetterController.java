package com.dreamCollection.letter.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.global.response.PageResponse;
import com.dreamCollection.letter.dto.LetterResponse;
import com.dreamCollection.letter.service.LetterService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * 마이페이지 "편지함". SecurityConfig에서 별도 permitAll 처리를 하지 않았으므로
 * anyRequest().authenticated() 규칙에 걸려 로그인한 회원만 호출 가능하다.
 */
@RestController
@RequestMapping("/api/letters")
@RequiredArgsConstructor
public class LetterController {

    private final LetterService letterService;

    @GetMapping
    public ApiResponse<PageResponse<LetterResponse>> getMyLetters(
            @AuthenticationPrincipal Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        var result = letterService.getMyLetters(userId, PageRequest.of(page, size));
        return ApiResponse.ok(PageResponse.from(result));
    }

    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount(@AuthenticationPrincipal Long userId) {
        return ApiResponse.ok(letterService.countUnread(userId));
    }

    @GetMapping("/{id}")
    public ApiResponse<LetterResponse> getOne(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id
    ) {
        return ApiResponse.ok(letterService.getOneAndMarkRead(userId, id));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long id
    ) {
        letterService.delete(userId, id);
        return ApiResponse.ok(null, "편지를 삭제했어요.");
    }
}
