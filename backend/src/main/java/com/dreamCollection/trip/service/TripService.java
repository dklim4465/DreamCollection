package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.PlanResponseDTO;

import java.util.List;

public interface TripService {

    PlanResponseDTO recommend(PlanRequestDTO planRequestDTO);

    List<String> getOptions(String type);
}
