package com.dreamCollection.trip.util;

import com.dreamCollection.trip.dto.DayPlanDTO;
import com.dreamCollection.trip.dto.ScheduleItemDTO;
import com.dreamCollection.trip.dto.TripRecommendDTO;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Component
public class TripScheduleSorter {

    private static final int UNKNOWN_TIME_SLOT_ORDER = Integer.MAX_VALUE;

    private static final Map<String, Integer> TIME_SLOT_ORDER = Map.of(
            "Morning", 1,
            "Lunch", 2,
            "Afternoon", 3,
            "Dinner", 4,
            "Night", 5
    );

    public TripRecommendDTO sort(TripRecommendDTO recommendation) {
        if (recommendation == null) {
            return null;
        }

        return TripRecommendDTO.builder()
                .recommendation(recommendation.getRecommendation())
                .title(recommendation.getTitle())
                .summary(recommendation.getSummary())
                .days(sortDays(recommendation.getDays()))
                .build();
    }

    private List<DayPlanDTO> sortDays(List<DayPlanDTO> days) {
        if (days == null) {
            return null;
        }

        List<DayPlanDTO> sortedDays = new ArrayList<>(days);

        sortedDays.sort(Comparator.comparing(
                this::dayNumberOrNull,
                Comparator.nullsLast(Integer::compareTo)
        ));

        return sortedDays.stream()
                .map(this::sortDayItems)
                .toList();
    }

    private DayPlanDTO sortDayItems(DayPlanDTO day) {
        if (day == null) {
            return null;
        }

        return DayPlanDTO.builder()
                .dayNumber(day.getDayNumber())
                .dayTitle(day.getDayTitle())
                .items(sortItems(day.getItems()))
                .build();
    }

    private List<ScheduleItemDTO> sortItems(List<ScheduleItemDTO> items) {
        if (items == null) {
            return null;
        }

        List<ScheduleItemDTO> sortedItems = new ArrayList<>(items);

        sortedItems.sort(Comparator.comparingInt(this::timeSlotOrder));

        return sortedItems;
    }

    private Integer dayNumberOrNull(DayPlanDTO day) {
        return day == null ? null : day.getDayNumber();
    }

    private int timeSlotOrder(ScheduleItemDTO item) {
        if (item == null || item.getTimeSlot() == null) {
            return UNKNOWN_TIME_SLOT_ORDER;
        }

        return TIME_SLOT_ORDER.getOrDefault(item.getTimeSlot(), UNKNOWN_TIME_SLOT_ORDER);
    }
}