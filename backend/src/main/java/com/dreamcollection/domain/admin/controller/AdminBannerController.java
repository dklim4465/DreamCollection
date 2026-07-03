package com.dreamcollection.domain.admin.controller;

import com.dreamcollection.domain.admin.dto.BannerAdminRequest;
import com.dreamcollection.domain.main.service.BannerService;
import com.dreamcollection.domain.main.dto.BannerResponse;
import com.dreamcollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 이 컨트롤러 전체는 SecurityConfig에서 /api/admin/** → hasRole("ADMIN")으로 보호됨
@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerResponse>> getAll() {
        return ApiResponse.ok(bannerService.getAllForAdmin());
    }

    @PostMapping
    public ApiResponse<BannerResponse> create(Authentication authentication,
                                               @Valid @RequestBody BannerAdminRequest request) {
        Long adminId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(bannerService.create(adminId, request), "배너가 등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<BannerResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody BannerAdminRequest request) {
        return ApiResponse.ok(bannerService.update(id, request), "배너가 수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ApiResponse.ok(null, "배너가 삭제되었습니다.");
    }
}
