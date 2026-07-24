package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.PlanResponseDTO;

public interface TripService {

    PlanResponseDTO recommend(PlanRequestDTO planRequestDTO);
}
