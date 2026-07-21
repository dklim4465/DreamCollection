package com.dreamCollection.trip.service;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.service.PlaceService;
import com.dreamCollection.trip.ai.TripAiClient;
import com.dreamCollection.trip.ai.TripPromptBuilder;
import com.dreamCollection.trip.dto.*;
import com.dreamCollection.trip.option.TripOptionProvider;
import com.dreamCollection.trip.recommend.TripRecommendationBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import com.dreamCollection.trip.exception.TripRecommendFailedException;

import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripAiClient tripAiClient;
    private final TripPromptBuilder tripPromptBuilder;
    private final TripRecommendationBuilder tripRecommendationBuilder;
    private final TripOptionProvider tripOptionProvider;
    private final PlaceService placeService;

    @Override
    public PlanResponseDTO recommend(PlanRequestDTO request) {
        String city = resolveCity(request);
        if (city == null) {
            log.warn("recommend: city를 결정할 수 없음 (destination/region 비어 있음)");
            throw new TripRecommendFailedException();
        }

        List<PlaceResponse> places = placeService.getPlaces(city, null);
        log.info("recommend place candidates city={}, count={}", city, places.size());
        if (places.isEmpty()) {
            log.warn("recommend: Place 후보 없음 city={}", city);
            throw new TripRecommendFailedException();
        }

        String prompt = tripPromptBuilder.build(request, places);
        String aiResult = tripAiClient.recommend(prompt);
        List<TripRecommendDTO> recommendations =
                tripRecommendationBuilder.build(request, aiResult, places);
        if (isAiFailed(aiResult) || recommendations.isEmpty()) {
            log.warn("recommend 1차 실패 → 1회 재시도");
            aiResult = tripAiClient.recommend(prompt);
            recommendations = tripRecommendationBuilder.build(request, aiResult, places);
        }
        if (isAiFailed(aiResult) || recommendations.isEmpty()) {
            throw new TripRecommendFailedException();
        }
        return buildResponse(request, prompt, aiResult, recommendations);
    }

    @Override
    public List<String> getOptions(String type) {
        return tripOptionProvider.getOptions(type);
    }

    private String resolveCity(PlanRequestDTO request) {
        if (request.getDestination() != null && !request.getDestination().isBlank()) {
            return request.getDestination().trim();
        }
        if (request.getRegion() != null && !request.getRegion().isBlank()) {
            return request.getRegion().trim();
        }
        return null;
    }

    private boolean isAiFailed(String aiResult) {
        return aiResult == null
                || aiResult.isBlank()
                || aiResult.startsWith("AI_");
    }
    private PlanResponseDTO buildResponse(
            PlanRequestDTO request,
            String prompt,
            String aiResult,
            List<TripRecommendDTO> recommendations
    ) {
        return PlanResponseDTO.builder()
                .who(request.getWho())
                .startDate(request.getStartDate())
                .when(request.getWhen())
                .region(request.getRegion())
                .theme(request.getTheme())
                .level(request.getLevel())
                .flightCondition(request.getFlightCondition())
                .destination(request.getDestination())
                .accommodationCondition(request.getAccommodationCondition())
                .prompt(prompt)
                .aiResult(aiResult)
                .recommendations(recommendations)
                .build();
    }
}
