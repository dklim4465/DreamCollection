package com.dreamCollection.mypage.service;

import com.dreamCollection.mypage.dto.SavedTripSummaryDTO;
import com.dreamCollection.mypage.repository.MySavedTripRepository;
import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.TripRecommendDTO;
import com.dreamCollection.trip.entity.SavedTrip;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;

import java.util.List;

@Log4j2
@Service
@RequiredArgsConstructor
public class MySavedTripServiceImpl implements MySavedTripService {

    private final MySavedTripRepository mySavedTripRepository;
    private final ObjectMapper objectMapper;

    @Override
    public List<SavedTripSummaryDTO> getMySavedTrips(Long userId) {
        return mySavedTripRepository.findByUserIdOrderByCreatedDateDesc(userId).stream()
                .map(this::toSummary)
                .toList();
    }

    private SavedTripSummaryDTO toSummary(SavedTrip savedTrip) {
        String title = null;
        String region = null;
        String theme = null;

        try {
            TripRecommendDTO recommendation = objectMapper.readValue(
                    savedTrip.getRecommendationJson(), TripRecommendDTO.class);
            title = recommendation.getTitle();
        } catch (Exception e) {
            log.warn("저장된 여행(id={}) 추천 JSON 파싱 실패, title 없이 내려줌", savedTrip.getId());
        }

        try {
            if (savedTrip.getConditionsJson() != null) {
                PlanRequestDTO conditions = objectMapper.readValue(
                        savedTrip.getConditionsJson(), PlanRequestDTO.class);
                region = conditions.getRegion();
                theme = conditions.getTheme();
            }
        } catch (Exception e) {
            log.warn("저장된 여행(id={}) 조건 JSON 파싱 실패, region/theme 없이 내려줌", savedTrip.getId());
        }

        return new SavedTripSummaryDTO(savedTrip.getId(), title, region, theme, savedTrip.getCreatedDate());
    }
}
