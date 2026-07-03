package com.dreamcollection.domain.city.controller;

import com.dreamcollection.domain.city.dto.CityResponse;
import com.dreamcollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.dreamcollection.domain.city.service.CityService;

@RestController
@RequestMapping("/api/cities")
@RequiredArgsConstructor
public class CityController {

    private final CityService cityService;

    // GET /api/cities/search?keyword=도쿄
    @GetMapping("/search")
    public ApiResponse<List<CityResponse>> search(@RequestParam String keyword) {
        return ApiResponse.ok(cityService.search(keyword));
    }

    // GET /api/cities/popular
    @GetMapping("/popular")
    public ApiResponse<List<CityResponse>> popular() {
        return ApiResponse.ok(cityService.getPopularCities());
    }
}
