package com.dreamCollection.board.controller;


import com.dreamCollection.board.dto.ReportCreateRequestDTO;
import com.dreamCollection.board.dto.ReportResponseDTO;
import com.dreamCollection.board.service.ReportService;
import com.dreamCollection.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/board/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponseDTO>> createReport(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody ReportCreateRequestDTO requestDTO
            ){
        ReportResponseDTO responseDTO = reportService.createReport(userId, requestDTO);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.ok(responseDTO,"신고가 접수되었습니다."));
}

@GetMapping("/me")
public ApiResponse<List<ReportResponseDTO>> getMyReports(
        @AuthenticationPrincipal Long userId
){
    return ApiResponse.ok(reportService.getMyReports(userId));
    }
}
