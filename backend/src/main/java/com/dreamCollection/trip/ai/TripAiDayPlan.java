package com.dreamCollection.trip.ai;

import java.util.List;

public record TripAiDayPlan(
        Integer dayNumber,
        List<TripAiScheduleItem> items
) {
}
