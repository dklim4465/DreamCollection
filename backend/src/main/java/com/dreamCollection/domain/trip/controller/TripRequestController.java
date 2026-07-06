package com.dreamcollection.domain.trip.controller;

import com.dreamcollection.domain.trip.dto.PlanRequestDTO;
import com.dreamcollection.domain.trip.dto.PlanResponseDTO;
import com.dreamcollection.domain.trip.dto.SaveTripRequestDTO;
import com.dreamcollection.domain.trip.dto.SaveTripResponseDTO;
import com.dreamcollection.domain.trip.service.TripService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/trip")
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
    public SaveTripResponseDTO saveTrip(@RequestBody SaveTripRequestDTO saveTripRequestDTO){
        return tripService.save(saveTripRequestDTO);
    }

}
