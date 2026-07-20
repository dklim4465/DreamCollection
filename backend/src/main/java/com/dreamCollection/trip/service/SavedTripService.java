package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.SaveTripRequestDTO;
import com.dreamCollection.trip.dto.SaveTripResponseDTO;
import com.dreamCollection.trip.dto.SavedTripDTO;
import com.dreamCollection.trip.dto.page.SavedTripPageRequest;
import org.springframework.data.domain.Page;

import java.util.List;

public interface SavedTripService {

    SaveTripResponseDTO save(Long userId, SaveTripRequestDTO saveTripRequestDTO);

    SavedTripDTO getSavedTrip(Long userId, Long savedTripId);

    List<SavedTripDTO> getSavedTrips(Long userId);

    void deleteSavedTrip(Long userId, Long savedTripId);

    void modify(Long userId, Long savedTripId, SaveTripRequestDTO request);

    Page<SavedTripDTO> getSavedTrips(Long userId, SavedTripPageRequest request);
}