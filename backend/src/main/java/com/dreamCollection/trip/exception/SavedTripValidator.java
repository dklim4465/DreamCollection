package com.dreamCollection.trip.exception;

import com.dreamCollection.trip.dto.SaveTripRequestDTO;
import com.dreamCollection.trip.exception.TripSaveException;
import org.springframework.stereotype.Component;

@Component
public class SavedTripValidator {

    public void validateSave(Long userId, SaveTripRequestDTO request) {
        validateUserId(userId);

        if (request == null) {
            throw new TripSaveException("저장 요청 정보가 없습니다.");
        }

        if (request.getConditions() == null) {
            throw new TripSaveException("저장할 여행 조건이 없습니다.");
        }

        if (request.getRecommendation() == null) {
            throw new TripSaveException("저장할 추천 일정이 없습니다.");
        }
    }

    public void validateFind(Long userId, Long savedTripId) {
        validateUserId(userId);
        validateSavedTripId(savedTripId);
    }

    public void validateUserId(Long userId) {
        if (userId == null) {
            throw new TripSaveException("사용자 정보가 없습니다.");
        }
    }

    private void validateSavedTripId(Long savedTripId) {
        if (savedTripId == null) {
            throw new TripSaveException("일정 번호가 없습니다.");
        }
    }
    public void validateUpdate(Long userId, Long savedTripId, SaveTripRequestDTO request) {
        validateFind(userId, savedTripId);

        if (request == null) {
            throw new TripSaveException("수정 요청 정보가 없습니다.");
        }

        if (request.getRecommendation() == null) {
            throw new TripSaveException("수정할 추천 일정이 없습니다.");
        }
    }
}