package com.dreamCollection.trip.mapper;

import com.dreamCollection.accommodation.dto.AccommodationSelectionDTO;
import com.dreamCollection.flight.dto.FlightSelectionDTO;
import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.SavedTripDTO;
import com.dreamCollection.trip.dto.TripRecommendDTO;
import com.dreamCollection.trip.entity.SavedTrip;
import com.dreamCollection.trip.exception.TripSaveException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SavedTripMapper {

    private final ObjectMapper objectMapper;

    public String toJson(Object value) {
        if (value == null) {
            //항공 혹은 숙소 미선택 할 수도 있음 그래서 선택 안하면 null 반환
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            throw new TripSaveException("일정 JSON 변환에 실패했습니다.", e);
        }
    }

    public <T> T fromJson(String json, Class<T> type) {
        if (json == null || json.isBlank()) {
            return null;
        }

        try {
            return objectMapper.readValue(json, type);
        } catch (JsonProcessingException e) {
            throw new TripSaveException("저장된 일정 JSON 변환에 실패했습니다.", e);
        }
    }

    public SavedTripDTO toDTO(SavedTrip savedTrip) {
        return SavedTripDTO.builder()
                .savedTripId(savedTrip.getId())
                .userId(savedTrip.getUserId())
                .conditions(fromJson(savedTrip.getConditionsJson(), PlanRequestDTO.class))
                .recommendation(fromJson(savedTrip.getRecommendationJson(), TripRecommendDTO.class))
                .flightSelection(fromJson(savedTrip.getFlightSelectionJson(), FlightSelectionDTO.class))
                .accommodationSelection(fromJson(savedTrip.getAccommodationSelectionJson(), AccommodationSelectionDTO.class))
                .createdDate(savedTrip.getCreatedDate())
                .build();
    }
}