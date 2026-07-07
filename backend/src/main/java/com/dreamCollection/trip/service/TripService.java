package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.*;

import java.util.List;

public interface TripService {

    PlanResponseDTO recommend(PlanRequestDTO planRequestDTO);

    String buildPrompt(PlanRequestDTO planRequestDTO);

    List<String> getOptions(String type);

    SaveTripResponseDTO save(SaveTripRequestDTO saveTripRequestDTO);

    //저장된 내용 조회용
    SavedTripDTO getSavedTrip(Long savedTripId);
    List<SavedTripDTO> getSavedTripsByUser(Long userId);

    // 일정 삭제
    void deleteSavedTrip(Long savedTripId);


}
