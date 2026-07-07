package com.dreamCollection.main.controller;

import com.dreamCollection.main.dto.MonthlyDestinationResponse;
import com.dreamCollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.dreamCollection.main.service.MonthlyDestinationService;

@RestController
@RequestMapping("/api/main/monthly-destination")
@RequiredArgsConstructor
public class MonthlyDestinationController {

    private final MonthlyDestinationService monthlyDestinationService;

    @GetMapping
    public ApiResponse<List<MonthlyDestinationResponse>> getCurrentMonth() {
        return ApiResponse.ok(monthlyDestinationService.getCurrentMonthDestinations());
    }
}
