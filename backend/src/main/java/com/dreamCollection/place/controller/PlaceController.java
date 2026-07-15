package com.dreamCollection.place.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.place.service.PlaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/places")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    @GetMapping
    public ApiResponse<List<PlaceResponse>> getPlaces(
            @RequestParam String city,
            @RequestParam(required = false) PlaceCategory category
    ) {
        return ApiResponse.ok(placeService.getPlaces(city, category));
    }
}