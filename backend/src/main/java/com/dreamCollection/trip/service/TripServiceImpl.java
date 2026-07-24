package com.dreamCollection.trip.service;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.place.service.PlaceService;
import com.dreamCollection.trip.TripPlacePools;
import com.dreamCollection.trip.ai.TripAiClient;
import com.dreamCollection.trip.ai.TripAiGenerateData;
import com.dreamCollection.trip.ai.TripPromptBuilder;
import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.PlanResponseDTO;
import com.dreamCollection.trip.dto.TripRecommendDTO;
import com.dreamCollection.trip.exception.TripRecommendFailedException;
import com.dreamCollection.trip.recommend.TripRecommendationBuilder;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

@Log4j2
@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripAiClient tripAiClient;
    private final TripPromptBuilder tripPromptBuilder;
    private final TripRecommendationBuilder tripRecommendationBuilder;
    private final PlaceService placeService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public PlanResponseDTO recommend(PlanRequestDTO request) {
        String city = resolveCity(request);
        if (city == null) {
            log.warn("recommend: city could not be resolved.");
            throw new TripRecommendFailedException();
        }

        List<PlaceResponse> places = placeService.getPlaces(city, null);
        log.info("recommend place candidates city={}, count={}", city, places.size());
        if (places.isEmpty()) {
            log.warn("recommend: place candidates are empty. city={}", city);
            throw new TripRecommendFailedException();
        }

        TripPlacePools pools = TripPlacePools.from(places);
        log.info(
                "recommend place pools city={}, meal={}, activity={}, mealByCategory={}, activityByCategory={}",
                city,
                pools.mealPlaces().size(),
                pools.activityPlaces().size(),
                categoryCounts(pools.mealPlaces()),
                categoryCounts(pools.activityPlaces())
        );
        if (pools.mealEmpty() || pools.activityEmpty()) {
            log.warn(
                    "recommend: place pools incomplete. city={}, meal={}, activity={}",
                    city,
                    pools.mealPlaces().size(),
                    pools.activityPlaces().size()
            );
            throw new TripRecommendFailedException();
        }

        String prompt = tripPromptBuilder.build(request, pools);
        TripAiGenerateData aiResult = tripAiClient.recommend(prompt);
        List<TripRecommendDTO> recommendations =
                tripRecommendationBuilder.build(request, aiResult, pools);

        if (isAiFailed(aiResult) || recommendations.isEmpty()) {
            log.warn("recommend first attempt failed. retrying once.");
            aiResult = tripAiClient.recommend(prompt);
            recommendations = tripRecommendationBuilder.build(request, aiResult, pools);
        }

        if (isAiFailed(aiResult) || recommendations.isEmpty()) {
            throw new TripRecommendFailedException();
        }

        return buildResponse(request, prompt, aiResult, recommendations);
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

    private boolean isAiFailed(TripAiGenerateData aiResult) {
        return aiResult == null
                || aiResult.days() == null
                || aiResult.days().isEmpty();
    }

    private PlanResponseDTO buildResponse(
            PlanRequestDTO request,
            String prompt,
            TripAiGenerateData aiResult,
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
                .aiResult(serializeAiResult(aiResult))
                .recommendations(recommendations)
                .build();
    }

    private String serializeAiResult(TripAiGenerateData aiResult) {
        if (aiResult == null) {
            return "";
        }
        try {
            return objectMapper.writeValueAsString(aiResult);
        } catch (JsonProcessingException e) {
            log.warn("AI result serialization failed", e);
            return "";
        }
    }

    private static Map<PlaceCategory, Long> categoryCounts(List<PlaceResponse> places) {
        Map<PlaceCategory, Long> counts = new EnumMap<>(PlaceCategory.class);
        for (PlaceResponse place : places) {
            if (place.category() == null) {
                continue;
            }
            counts.merge(place.category(), 1L, Long::sum);
        }
        return counts;
    }
}
