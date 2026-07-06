package com.dreamcollection.domain.trip.service;

import com.dreamcollection.domain.trip.dto.PlanRequestDTO;
import com.dreamcollection.domain.trip.dto.PlanResponseDTO;
import com.dreamcollection.domain.trip.dto.SaveTripRequestDTO;
import com.dreamcollection.domain.trip.dto.SaveTripResponseDTO;

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
