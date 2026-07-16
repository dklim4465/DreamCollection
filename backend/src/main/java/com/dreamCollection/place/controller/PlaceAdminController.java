package com.dreamCollection.place.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.place.dto.PlaceSyncResponse;
import com.dreamCollection.place.service.PlaceSyncService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/places")
@RequiredArgsConstructor
public class PlaceAdminController {

    private final PlaceSyncService placeSyncService;

    @PostMapping("/sync/serp")
    public ApiResponse<PlaceSyncResponse> syncSerpPlaces(
            @RequestParam(defaultValue = "도쿄") String city
    ) {
        return ApiResponse.ok(placeSyncService.syncTokyoPlaces(city));
    }
}