package com.dreamCollection.accommodation.service;

import com.dreamCollection.accommodation.dto.AccommodationRequestDTO;
import com.dreamCollection.accommodation.dto.AccommodationResponseDTO;

import java.util.List;

public interface AccommodationService {

    List<AccommodationResponseDTO> searchAccommodations(AccommodationRequestDTO requestDTO);
}
