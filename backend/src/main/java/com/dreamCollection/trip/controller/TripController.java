package com.dreamCollection.trip.controller;

import com.dreamCollection.trip.dto.*;
import com.dreamCollection.trip.service.SavedTripService;
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
public class TripController {

    private final TripService tripService;
    private final SavedTripService savedTripService;

    // 사용자가 선택 할 수 있도록 보여주는 곳
    @GetMapping("/options/{type}")
    public List<String> getOptions(@PathVariable String type) {
        return tripService.getOptions(type);
    }


    @PostMapping("/recommend")
    public PlanResponseDTO recommend(@RequestBody PlanRequestDTO planRequestDTO) {
        return tripService.recommend(planRequestDTO);
    }

    // 선택 이후의 사용되는 곳

    @PostMapping("/saved")
    public SaveTripResponseDTO save(@AuthenticationPrincipal Long userId, @RequestBody SaveTripRequestDTO saveTripRequestDTO){
        return savedTripService.save(userId, saveTripRequestDTO);
    }

    @GetMapping("/saved/me")
    public List<SavedTripDTO> getSavedTrips(@AuthenticationPrincipal Long userId) {
        return savedTripService.getSavedTrips(userId);
    }

    @GetMapping("/saved/{savedTripId}")
    public SavedTripDTO getSavedTrip(@AuthenticationPrincipal Long userId, @PathVariable Long savedTripId) {
        return savedTripService.getSavedTrip(userId, savedTripId);
    }

    @DeleteMapping("/remove/{savedTripId}")
    public void deleteSavedTrip(@AuthenticationPrincipal Long userId, @PathVariable Long savedTripId) {
        savedTripService.deleteSavedTrip(userId, savedTripId);
    }
    @PutMapping("/saved/{savedTripId}")
    public void modifySavedTrip(
            @AuthenticationPrincipal Long userId,
            @PathVariable Long savedTripId,
            @RequestBody SaveTripRequestDTO request
    ) {
        savedTripService.modify(userId, savedTripId, request);
    }

}
