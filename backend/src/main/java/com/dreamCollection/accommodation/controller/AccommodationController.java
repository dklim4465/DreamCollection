package com.dreamCollection.accommodation.controller;

import com.dreamCollection.accommodation.dto.AccommodationRequestDTO;
import com.dreamCollection.accommodation.dto.AccommodationResponseDTO;
import com.dreamCollection.accommodation.service.AccommodationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/accommodation")
@RequiredArgsConstructor
public class AccommodationController {

    private final AccommodationService accommodationService;

    @PostMapping("/search")
    public List<AccommodationResponseDTO> searchAccommodations(@RequestBody AccommodationRequestDTO requestDTO){
        return accommodationService.searchAccommodations(requestDTO);
    }
}
