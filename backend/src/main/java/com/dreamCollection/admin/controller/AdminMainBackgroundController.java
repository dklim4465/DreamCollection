package com.dreamCollection.admin.controller;

import com.dreamCollection.admin.dto.MainBackgroundAdminRequest;
import com.dreamCollection.main.service.MainBackgroundService;
import com.dreamCollection.main.dto.MainBackgroundResponse;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/main-backgrounds")
@RequiredArgsConstructor
public class AdminMainBackgroundController {

    private final MainBackgroundService mainBackgroundService;

    @GetMapping
    public ApiResponse<List<MainBackgroundResponse>> getAll() {
        return ApiResponse.ok(mainBackgroundService.getAllForAdmin());
    }

    @PostMapping
    public ApiResponse<MainBackgroundResponse> create(Authentication authentication,
                                                        @Valid @RequestBody MainBackgroundAdminRequest request) {
        Long adminId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(mainBackgroundService.create(adminId, request), "메인 배경이 등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<MainBackgroundResponse> update(@PathVariable Long id,
                                                        @Valid @RequestBody MainBackgroundAdminRequest request) {
        return ApiResponse.ok(mainBackgroundService.update(id, request), "메인 배경이 수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        mainBackgroundService.delete(id);
        return ApiResponse.ok(null, "메인 배경이 삭제되었습니다.");
    }
}
