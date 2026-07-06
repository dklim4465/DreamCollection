package com.dreamCollection.admin.controller;

import com.dreamCollection.admin.dto.MonthlyDestinationAdminRequest;
import com.dreamCollection.main.service.MonthlyDestinationService;
import com.dreamCollection.main.dto.MonthlyDestinationResponse;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/monthly-destinations")
@RequiredArgsConstructor
public class AdminMonthlyDestinationController {

    private final MonthlyDestinationService monthlyDestinationService;

    @GetMapping
    public ApiResponse<List<MonthlyDestinationResponse>> getAll() {
        return ApiResponse.ok(monthlyDestinationService.getAllForAdmin());
    }

    @PostMapping
    public ApiResponse<MonthlyDestinationResponse> create(Authentication authentication,
                                                            @Valid @RequestBody MonthlyDestinationAdminRequest request) {
        Long adminId = (Long) authentication.getPrincipal();
        return ApiResponse.ok(monthlyDestinationService.create(adminId, request), "이달의 여행지가 등록되었습니다.");
    }

    @PutMapping("/{id}")
    public ApiResponse<MonthlyDestinationResponse> update(@PathVariable Long id,
                                                            @Valid @RequestBody MonthlyDestinationAdminRequest request) {
        return ApiResponse.ok(monthlyDestinationService.update(id, request), "이달의 여행지가 수정되었습니다.");
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        monthlyDestinationService.delete(id);
        return ApiResponse.ok(null, "이달의 여행지가 삭제되었습니다.");
    }
}
