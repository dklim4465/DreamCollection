package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.SaveTripRequestDTO;
import com.dreamCollection.trip.dto.SaveTripResponseDTO;
import com.dreamCollection.trip.dto.SavedTripDTO;
import com.dreamCollection.trip.dto.TripRecommendDTO;
import com.dreamCollection.trip.dto.page.SavedTripPageRequest;
import com.dreamCollection.trip.entity.SavedTrip;
import com.dreamCollection.trip.exception.SavedTripValidator;
import com.dreamCollection.trip.exception.TripSaveException;
import com.dreamCollection.trip.mapper.SavedTripMapper;
import com.dreamCollection.trip.repository.SavedTripRepository;
import com.dreamCollection.trip.repository.SavedTripSpecs;
import com.dreamCollection.trip.util.TripScheduleSorter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SavedTripServiceImpl implements SavedTripService {

    private final SavedTripRepository savedTripRepository;
    private final SavedTripMapper savedTripMapper;
    private final SavedTripValidator savedTripValidator;
    private final TripScheduleSorter tripScheduleSorter;

    @Override
    public SaveTripResponseDTO save(Long userId, SaveTripRequestDTO request) {
        savedTripValidator.validateSave(userId, request);

        SavedTrip result = savedTripRepository.save(createSavedTrip(userId, request));

        return SaveTripResponseDTO.builder()
                .savedTripId(result.getId())
                .message("일정이 저장되었습니다.")
                .build();
    }


    @Override
    public List<SavedTripDTO> getSavedTrips(Long userId) {
        savedTripValidator.validateUserId(userId);

        return savedTripRepository.findByUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(savedTripMapper::toDTO)
                .map(this::sortRecommendation)
                .toList();
    }

    @Override
    public SavedTripDTO getSavedTrip(Long userId, Long savedTripId) {
        SavedTrip savedTrip = findSavedTripByUser(userId, savedTripId, "저장된 일정이 없습니다.");
        return sortRecommendation(savedTripMapper.toDTO(savedTrip));
    }

    @Override
    public void deleteSavedTrip(Long userId, Long savedTripId) {
        SavedTrip savedTrip = findSavedTripByUser(userId, savedTripId, "삭제할 일정이 없습니다.");
        savedTripRepository.delete(savedTrip);
    }

    @Override
    public void modify(Long userId, Long savedTripId, SaveTripRequestDTO request) {
        savedTripValidator.validateUpdate(userId, savedTripId, request);

        SavedTrip savedTrip = savedTripRepository.findByIdAndUserId(savedTripId, userId)
                .orElseThrow(() -> new TripSaveException("수정할 일정이 없습니다."));

        TripRecommendDTO sortedRecommendation = tripScheduleSorter.sort(request.getRecommendation());
        savedTrip.changeRecommendation(savedTripMapper.toJson(sortedRecommendation));

        savedTripRepository.save(savedTrip);
    }

    @Override
    public Page<SavedTripDTO> getSavedTrips(Long userId, SavedTripPageRequest request) {
        savedTripValidator.validateUserId(userId);

        return savedTripRepository
                .findAll(SavedTripSpecs.from(userId, request), request.toPageable())
                .map(savedTripMapper::toDTO)
                .map(this::sortRecommendation);
    }

    private SavedTrip findSavedTripByUser(Long userId, Long savedTripId, String message) {
        savedTripValidator.validateFind(userId, savedTripId);

        return savedTripRepository.findByIdAndUserId(savedTripId, userId)
                .orElseThrow(() -> new TripSaveException(message));
    }

    private SavedTrip createSavedTrip(Long userId, SaveTripRequestDTO request) {
        TripRecommendDTO sortedRecommendation = tripScheduleSorter.sort(request.getRecommendation());

        return SavedTrip.builder()
                .userId(userId)
                .conditionsJson(savedTripMapper.toJson(request.getConditions()))
                .recommendationJson(savedTripMapper.toJson(sortedRecommendation))
                .flightSelectionJson(savedTripMapper.toJson(request.getFlightSelection()))
                .accommodationSelectionJson(savedTripMapper.toJson(request.getAccommodationSelection()))
                .build();
    }

    private SavedTripDTO sortRecommendation(SavedTripDTO savedTripDTO) {
        if (savedTripDTO == null) {
            return null;
        }

        return SavedTripDTO.builder()
                .savedTripId(savedTripDTO.getSavedTripId())
                .userId(savedTripDTO.getUserId())
                .conditions(savedTripDTO.getConditions())
                .recommendation(tripScheduleSorter.sort(savedTripDTO.getRecommendation()))
                .flightSelection(savedTripDTO.getFlightSelection())
                .accommodationSelection(savedTripDTO.getAccommodationSelection())
                .createdDate(savedTripDTO.getCreatedDate())
                .build();
    }
}
