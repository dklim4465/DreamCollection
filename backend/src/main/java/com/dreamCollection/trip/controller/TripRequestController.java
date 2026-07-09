package com.dreamCollection.trip.controller;

import com.dreamCollection.trip.dto.*;
import com.dreamCollection.trip.service.TripService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Log4j2
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000"
})
@RequestMapping("/api/trip")
public class TripRequestController {

    private final TripService tripService;

    // 사용자가 선택 할 수 있도록 보여주는 곳
    @GetMapping("/options/{type}")
    public List<String> getOptions(@PathVariable String type) {
        return tripService.getOptions(type);
    }


    @PostMapping("/recommend")
    public PlanResponseDTO recommendByBody(@RequestBody PlanRequestDTO planRequestDTO) {
        return tripService.recommend(planRequestDTO);
    }

    // 선택 이후의 사용되는 곳

    @PostMapping("/save")
    public SaveTripResponseDTO saveTrip(@AuthenticationPrincipal Long userId, @RequestBody SaveTripRequestDTO saveTripRequestDTO){
        return tripService.save(userId, saveTripRequestDTO);
    }

    @GetMapping("/saved/me")
    public List<SavedTripDTO> getMySavedTrips(@AuthenticationPrincipal Long userId) {
        return tripService.getSavedTripsByUser(userId);
    }

    @GetMapping("/saved/{savedTripId}")
    public SavedTripDTO getSavedTrip(@AuthenticationPrincipal Long userId, @PathVariable Long savedTripId) {
        return tripService.getSavedTrip(userId, savedTripId);
    }

    @DeleteMapping("/remove/{savedTripId}")
    public void deleteSavedTrip(@AuthenticationPrincipal Long userId, @PathVariable Long savedTripId) {
        tripService.deleteSavedTrip(userId, savedTripId);
    }

}
