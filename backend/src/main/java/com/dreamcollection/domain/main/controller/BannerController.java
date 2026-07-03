package com.dreamcollection.domain.main.controller;

import com.dreamcollection.domain.main.dto.BannerResponse;
import com.dreamcollection.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

import com.dreamcollection.domain.main.service.BannerService;

@RestController
@RequestMapping("/api/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public ApiResponse<List<BannerResponse>> getBanners() {
        return ApiResponse.ok(bannerService.getActiveBanners());
    }
}
