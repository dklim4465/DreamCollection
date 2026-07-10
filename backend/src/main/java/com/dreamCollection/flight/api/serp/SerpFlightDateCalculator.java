package com.dreamCollection.flight.api.serp;

import com.dreamCollection.flight.dto.FlightRequestDTO;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SerpFlightDateCalculator {
    // 시작날짜를 받아서 마지막 날짜를 계산하는 곳

    private static final Pattern DAY_COUNT_PATTERN = Pattern.compile("(\\d+)일");

    public LocalDate calculateReturnDate(FlightRequestDTO requestDTO) {
        int dayCount = extractDayCount(requestDTO.getWhen());

        return requestDTO.getStartDate().plusDays(dayCount - 1L);
    }

    private int extractDayCount(String when) {
        if (when == null || when.isBlank()) {
            return 1;
        }

        Matcher matcher = DAY_COUNT_PATTERN.matcher(when);

        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 1;
    }
}