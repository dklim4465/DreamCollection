package com.dreamCollection.trip.service;

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

    @Override
    public PlanResponseDTO recommend(PlanRequestDTO request) {
        String prompt = buildPrompt(request);
        String aiResult = tripAiClient.recommend(prompt);

        return buildResponse(request, prompt, aiResult);
    }


    @Override
    public List<String> getOptions(String type) {
        return tripOptionProvider.getOptions(type);
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