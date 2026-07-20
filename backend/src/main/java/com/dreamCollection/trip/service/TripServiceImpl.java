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
        List<PlaceResponse> places = List.of();

        if (city == null) {
            log.warn("recommend: city를 결정할 수 없음 (destination/region 비어 있음)");
        } else {
            places = placeService.getPlaces(city, null);
            log.info("recommend place candidates city={}, count={}", city, places.size());

            // 확인용: 앞에서 몇 개만 이름 찍기 (나중에 지워도 됨)
            places.stream()
                    .limit(5)
                    .forEach(p -> log.info("  - id={}, name={}, category={}",
                            p.id(), p.name(), p.category()));
        }

        String prompt = buildPrompt(request);
        String aiResult = tripAiClient.recommend(prompt);

        return buildResponse(request, prompt, aiResult);
    }


    @Override
    public List<String> getOptions(String type) {
        return tripOptionProvider.getOptions(type);
    }



    private String resolveCity(PlanRequestDTO request) {
        if (request.getDestination() != null && !request.getDestination().isBlank()) {
            return request.getDestination().trim();
        }
        // 혹시 destination이 비어 있을 때만 fallback (Step 0에서 맞춘 규칙 그대로)
        if (request.getRegion() != null && !request.getRegion().isBlank()) {
            return request.getRegion().trim();
        }
        return null;
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
                .destination(request.getDestination())
                .accommodationCondition(request.getAccommodationCondition())
                .prompt(prompt)
                .aiResult(aiResult)
                .recommendations(tripRecommendationBuilder.build(request, aiResult))
                .build();
    }

    private String buildPrompt(PlanRequestDTO request) {
        return tripPromptBuilder.build(request);
    }

}