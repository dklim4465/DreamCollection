package com.dreamCollection.flight.exception;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class FlightValidator {

    public void validateSearch(FlightRequestDTO request) {
        if (request == null) {
            throw new FlightException("항공 검색 요청 정보가 없습니다.");
        }

        if (request.getRegion() == null || request.getRegion().isBlank()) {
            throw new FlightException("국가 정보가 없습니다.");
        }

        if (request.getDestination() == null || request.getDestination().isBlank()) {
            throw new FlightException("도착지 정보가 없습니다.");
        }

        if (request.getStartDate() == null) {
            throw new FlightException("출발일 정보가 없습니다.");
        }

        if (request.getWhen() == null || request.getWhen().isBlank()) {
            throw new FlightException("여행 기간 정보가 없습니다.");
        }
    }
}