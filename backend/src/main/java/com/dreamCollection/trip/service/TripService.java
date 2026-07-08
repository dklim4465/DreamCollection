package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.PlanResponseDTO;
import com.dreamCollection.trip.dto.SavedTripSummaryDTO;
import com.dreamCollection.trip.dto.SaveTripRequestDTO;
import com.dreamCollection.trip.dto.SaveTripResponseDTO;

import java.util.List;

public interface TripService {

    PlanResponseDTO recommend(PlanRequestDTO planRequestDTO);

    String buildPrompt(PlanRequestDTO planRequestDTO);

    List<String> getOptions(String type);

    SaveTripResponseDTO save(SaveTripRequestDTO saveTripRequestDTO);

    // 홈페이지 "내가 저장한 여행" 미리보기 / 내 일정 목록
    List<SavedTripSummaryDTO> getMySavedTrips(Long userId);


    List<String> getWho();
    List<String> getWhen();
    List<String> getRegion();
    List<String> getTheme();
    List<String> getLevel();






//    ReplaceScheduleResponseDTO replaceScheduleItem(ReplaceScheduleRequestDTO replaceScheduleRequestDTO);


}
