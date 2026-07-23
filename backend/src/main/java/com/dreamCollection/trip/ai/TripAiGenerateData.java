package com.dreamCollection.trip.ai;

import java.util.List;

public record TripAiGenerateData(
        List<TripAiDayPlan> days
) {
}
