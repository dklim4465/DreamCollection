package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.*;

import java.util.List;

public interface TripService {

    PlanResponseDTO recommend(PlanRequestDTO planRequestDTO);

    List<String> getOptions(String type);



}
