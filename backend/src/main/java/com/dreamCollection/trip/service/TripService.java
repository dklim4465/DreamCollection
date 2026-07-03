package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.PlanResponseDTO;
import com.dreamCollection.trip.dto.SaveTripRequestDTO;
import com.dreamCollection.trip.dto.SaveTripResponseDTO;

import java.util.List;

public interface TripService {

    PlanResponseDTO recommend(PlanRequestDTO planRequestDTO);

    String buildPrompt(PlanRequestDTO planRequestDTO);

    List<String> getOptions(String type);

    SaveTripResponseDTO save(SaveTripRequestDTO saveTripRequestDTO);


    List<String> getWho();
    List<String> getWhen();
    List<String> getRegion();
    List<String> getTheme();
    List<String> getLevel();






//    ReplaceScheduleResponseDTO replaceScheduleItem(ReplaceScheduleRequestDTO replaceScheduleRequestDTO);


}
