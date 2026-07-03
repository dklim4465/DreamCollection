package com.dreamcollection.domain.main.controller;

import com.dreamcollection.domain.main.dto.ChecklistItemResponse;
import com.dreamcollection.domain.main.dto.CreateChecklistItemRequest;
import com.dreamcollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.dreamcollection.domain.main.service.ChecklistItemService;

@RestController
@RequestMapping("/api/checklist-items")
@RequiredArgsConstructor
public class ChecklistItemController {

    private final ChecklistItemService checklistItemService;

    // GET /api/checklist-items?requestId=1
    @GetMapping
    public ApiResponse<List<ChecklistItemResponse>> getItems(@RequestParam Long requestId) {
        return ApiResponse.ok(checklistItemService.getItems(requestId));
    }

    @PostMapping
    public ApiResponse<ChecklistItemResponse> create(@Valid @RequestBody CreateChecklistItemRequest request) {
        return ApiResponse.ok(checklistItemService.create(request), "체크리스트 항목이 추가되었습니다.");
    }

    // PATCH /api/checklist-items/{id}/toggle → 체크/해제 토글
    @PatchMapping("/{id}/toggle")
    public ApiResponse<ChecklistItemResponse> toggle(@PathVariable Long id) {
        return ApiResponse.ok(checklistItemService.toggle(id));
    }
}
