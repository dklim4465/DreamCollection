package com.dreamcollection.domain.admin.controller;

import com.dreamcollection.domain.admin.dto.AdminUserResponse;
import com.dreamcollection.domain.admin.dto.ChangeUserStatusRequest;
import com.dreamcollection.global.response.ApiResponse;
import com.dreamcollection.global.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import com.dreamcollection.domain.admin.service.AdminUserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminUserService adminUserService;

    // ?keyword=검색어(이메일/닉네임)&page=0&size=20
    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ApiResponse.ok(adminUserService.getUsers(keyword, page, size));
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AdminUserResponse> changeStatus(@PathVariable Long id,
                                                         @Valid @RequestBody ChangeUserStatusRequest request) {
        return ApiResponse.ok(adminUserService.changeStatus(id, request.status()), "회원 상태가 변경되었습니다.");
    }
}
