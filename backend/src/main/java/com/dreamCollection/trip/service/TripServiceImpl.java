package com.dreamCollection.trip.service;

import com.dreamCollection.trip.ai.TripAiClient;
import com.dreamCollection.trip.ai.TripPromptBuilder;
import com.dreamCollection.trip.dto.*;
import com.dreamCollection.trip.entity.SavedTrip;
import com.dreamCollection.trip.exception.TripSaveException;
import com.dreamCollection.trip.mapper.SavedTripMapper;
import com.dreamCollection.trip.option.TripOptionProvider;
import com.dreamCollection.trip.recommend.TripRecommendationBuilder;
import com.dreamCollection.trip.repository.SavedTripRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripAiClient tripAiClient;
    private final TripPromptBuilder tripPromptBuilder;
    private final TripRecommendationBuilder tripRecommendationBuilder;
    private final TripOptionProvider tripOptionProvider;
    private final SavedTripRepository savedTripRepository;
    private final SavedTripMapper savedTripMapper;

    @Override
    public PlanResponseDTO recommend(PlanRequestDTO request) {
        String prompt = buildPrompt(request);
        String aiResult = tripAiClient.recommend(prompt);

        return buildResponse(request, prompt, aiResult);
    }

    @Override
    public String buildPrompt(PlanRequestDTO request) {
        return tripPromptBuilder.build(request);
    }

    @Override
    public List<String> getOptions(String type) {
        return tripOptionProvider.getOptions(type);
    }

    @Override
    public SaveTripResponseDTO save(Long userId, SaveTripRequestDTO request) {
        validateUserId(userId);
        validateSaveRequest(request);

        SavedTrip savedTrip = SavedTrip.builder()
                .userId(userId)
                .conditionsJson(savedTripMapper.toJson(request.getConditions()))
                .recommendationJson(savedTripMapper.toJson(request.getRecommendation()))
                .flightSelectionJson(savedTripMapper.toJson(request.getFlightSelectionDTO()))
                .accommodationSelectionJson(savedTripMapper.toJson(request.getAccommodationSelectionDTO()))
                .build();

        SavedTrip result = savedTripRepository.save(savedTrip);

        return SaveTripResponseDTO.builder()
                .savedTripId(result.getId())
                .message("일정이 저장되었습니다.")
                .build();
    }

    @Override
    public SavedTripDTO getSavedTrip(Long userId,Long savedTripId) {
        SavedTrip savedTrip = findSavedTripByUser(userId ,savedTripId, "저장된 일정이 없습니다.");

        return savedTripMapper.toDTO(savedTrip);
    }

    @Override
    public List<SavedTripDTO> getSavedTripsByUser(Long userId) {
        validateUserId(userId);

        return savedTripRepository.findByUserIdOrderByCreatedDateDesc(userId)
                .stream()
                .map(savedTripMapper::toDTO)
                .toList();
    }

    @Override
    public void deleteSavedTrip(Long userId,Long savedTripId) {
        SavedTrip savedTrip = findSavedTripByUser(userId ,savedTripId, "삭제할 일정이 없습니다.");

        savedTripRepository.delete(savedTrip);
    }

    private PlanResponseDTO buildResponse(
            PlanRequestDTO request,
            String prompt,
            String aiResult
    ) {
        return PlanResponseDTO.builder()
                .who(request.getWho())
                .startDate(request.getStartDate())
                .when(request.getWhen())
                .region(request.getRegion())
                .theme(request.getTheme())
                .level(request.getLevel())
                .flightCondition(request.getFlightCondition())
                .accommodationCondition(request.getAccommodationCondition())
                .prompt(prompt)
                .aiResult(aiResult)
                .recommendations(tripRecommendationBuilder.build(request, aiResult))
                .build();
    }

    private void validateSaveRequest(SaveTripRequestDTO request) {
        if (request == null) {
            throw new TripSaveException("저장 요청 정보가 없습니다.");
        }

        if (request.getRecommendation() == null) {
            throw new TripSaveException("저장할 추천 일정이 없습니다.");
        }
    }

    private void validateUserId(Long userId) {
        if (userId == null) {
            throw new TripSaveException("사용자 정보가 없습니다.");
        }
    }

    private void validateSavedTripId(Long savedTripId) {
        if (savedTripId == null) {
            throw new TripSaveException("일정 번호가 없습니다.");
        }
    }
    private SavedTrip findSavedTripByUser(Long userId, Long savedTripId, String message) {
        validateUserId(userId);
        validateSavedTripId(savedTripId);

        SavedTrip savedTrip = savedTripRepository.findById(savedTripId)
                .orElseThrow(() -> new TripSaveException(message));

        if (!savedTrip.getUserId().equals(userId)) {
            throw new TripSaveException("본인의 일정만 접근할 수 있습니다.");
        }

        return savedTrip;
    }
}