package com.dreamCollection.accommodation.exception;

import com.dreamCollection.accommodation.dto.AccommodationRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class AccommodationValidator {

    public void validateSearch(AccommodationRequestDTO request) {
        if (request == null) {
            throw new AccommodationException("숙소 검색 요청 정보가 없습니다.");
        }

        if (request.getRegion() == null || request.getRegion().isBlank()) {
            throw new AccommodationException("국가 정보가 없습니다.");
        }

        if (request.getDestination() == null || request.getDestination().isBlank()) {
            throw new AccommodationException("도착지 정보가 없습니다.");
        }

        if (request.getStartDate() == null) {
            throw new AccommodationException("체크인 기준 날짜가 없습니다.");
        }

        if (request.getWhen() == null || request.getWhen().isBlank()) {
            throw new AccommodationException("여행 기간 정보가 없습니다.");
        }
    }
}