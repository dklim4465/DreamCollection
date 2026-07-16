package com.dreamCollection.flight.api.serp;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class SerpFlightDateCalculator {

    private static final Pattern DAY_COUNT_PATTERN = Pattern.compile("(\\d+)일");

    public LocalDate calculateReturnDate(LocalDate startDate, String when) {
        int dayCount = extractDayCount(when);
        return startDate.plusDays(dayCount - 1L);
    }

    private int extractDayCount(String when) {
        if (when == null || when.isBlank()) {
            return 1;
        }

        Matcher matcher = DAY_COUNT_PATTERN.matcher(when);

        return matcher.find() ? Integer.parseInt(matcher.group(1)) : 1;
    }
}