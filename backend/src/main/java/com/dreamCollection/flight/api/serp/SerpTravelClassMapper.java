package com.dreamCollection.flight.api.serp;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import org.springframework.stereotype.Component;

@Component
public class SerpTravelClassMapper {

    // SerpApi에선 기준을 아래 처럼 숫자 코드로 보내고 받는다
    // 우리의 서비스 문자열을 숫자로 변환해서 값을 보낸다
//      1 = Economy
//      2 = Premium economy
//      3 = Business
//      4 = First


    public String map(FlightRequestDTO requestDTO) {
        if (requestDTO.getFlightCondition() == null
                || requestDTO.getFlightCondition().getSeatClass() == null) {
            return "1";
        }

        return switch (requestDTO.getFlightCondition().getSeatClass()) {
            case "PREMIUM_ECONOMY" -> "2";
            case "BUSINESS" -> "3";
            case "FIRST" -> "4";
            default -> "1";
        };
    }
}