package com.dreamCollection.mate.controller;

import com.dreamCollection.global.response.ApiResponse;
import com.dreamCollection.mate.dto.CountryResponseDTO;
import com.dreamCollection.mate.service.MateCountryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mate/countries")
@RequiredArgsConstructor
public class MateCountryController {

    private final MateCountryService mateCountryService;

    @GetMapping
    public ApiResponse<List<CountryResponseDTO>> getCountries() {
        return ApiResponse.ok(mateCountryService.getCountries());
    }
}