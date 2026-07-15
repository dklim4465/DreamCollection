package com.dreamCollection.chat.controller;

import com.dreamCollection.chat.dto.FriendRequestResponseDTO;
import com.dreamCollection.chat.dto.FriendResponseDTO;
import com.dreamCollection.chat.dto.UserSearchResponseDTO;
import com.dreamCollection.chat.service.FriendService;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping("/search")
    public ApiResponse<List<UserSearchResponseDTO>> searchUsers(
            @AuthenticationPrincipal Long userId,
            @RequestParam String keyword
    ) {
        return ApiResponse.ok(friendService.searchUsers(keyword, userId));
    }

    @PostMapping("/requests/{receiverId}")
    public ApiResponse<Void> sendRequest(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long receiverId
    ) {
        friendService.sendRequest(userId, receiverId);
        return ApiResponse.ok(null, "친구 요청을 보냈습니다.");
    }

    @GetMapping("/requests/received")
    public ApiResponse<List<FriendRequestResponseDTO>> getReceivedRequests(
            @AuthenticationPrincipal Long userId
    ) {
        return ApiResponse.ok(friendService.getReceivedRequests(userId));
    }

    @PatchMapping("/requests/{requestId}")
    public ApiResponse<Void> decideRequest(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long requestId,
            @RequestParam String decision
    ) {
        friendService.decideRequest(userId, requestId, decision);
        String message = "ACCEPT".equals(decision) ? "친구 요청을 수락했습니다." : "친구 요청을 거절했습니다.";
        return ApiResponse.ok(null, message);
    }

    @GetMapping
    public ApiResponse<List<FriendResponseDTO>> getMyFriends(
            @AuthenticationPrincipal Long userId
    ) {
        return ApiResponse.ok(friendService.getMyFriends(userId));
    }

    @DeleteMapping("/{friendUserId}")
    public ApiResponse<Void> deleteFriend(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long friendUserId
    ) {
        friendService.deleteFriend(userId, friendUserId);
        return ApiResponse.ok(null, "친구를 삭제했습니다.");
    }
}