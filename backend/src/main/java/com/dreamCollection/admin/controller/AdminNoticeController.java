package com.dreamCollection.admin.controller;

import com.dreamCollection.admin.dto.NoticeAdminRequest;
import com.dreamCollection.main.service.NoticeService;
import com.dreamCollection.main.dto.NoticeResponse;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/notices")
@RequiredArgsConstructor
public class AdminNoticeController {

    private final NoticeService noticeService;

    @GetMapping
    public ApiResponse<List<NoticeResponse>> getAll() {
        return ApiResponse.ok(noticeService.getAllForAdmin());
    }

    @PostMapping
    public ApiResponse<NoticeResponse> create(Authentication authentication,
                                               @Valid @RequestBody NoticeAdminRequest request) {
        Long adminId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(noticeService.create(adminId, request), "공지사항이 등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<NoticeResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody NoticeAdminRequest request) {
        return ApiResponse.ok(noticeService.update(id, request), "공지사항이 수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        noticeService.delete(id);
        return ApiResponse.ok(null, "공지사항이 삭제되었습니다.");
    }
}
