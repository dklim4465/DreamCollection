package com.dreamCollection.trip.recommend;

import com.dreamCollection.trip.dto.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.IntStream;

@Component
public class TripRecommendationBuilder {

    private static final int DEFAULT_DAY_COUNT = 1;
    private static final Pattern DAY_COUNT_PATTERN = Pattern.compile("(\\d+)일");

    public List<TripRecommendDTO> build(PlanRequestDTO request, String aiResult) {
        return List.of(TripRecommendDTO.builder()
                .recommendation(1)
                .title(request.getRegion() + " 추천 일정")
                .summary(request.getWhen() + " " + request.getTheme() + " 추천 일정입니다.")
                .days(buildDays(dayCount(request.getWhen())))
                .build());
    }



    // 나중에 일정 수정할때 여기부터 건드리면 됨
    private static final List<ItemTemplate> ITEM_TEMPLATES = List.of(
            new ItemTemplate("Morning", "Activity", "오전 관광"),
            new ItemTemplate("Lunch", "Meal", "점심 식사"),
            new ItemTemplate("Afternoon", "Activity", "오후 일정"),
            new ItemTemplate("Dinner", "Meal", "저녁 식사")
    );



    private List<DayPlanDTO> buildDays(int dayCount) {
        return IntStream.rangeClosed(1, dayCount)
                .mapToObj(this::buildDay)
                .toList();
    }

    private DayPlanDTO buildDay(int dayNumber) {
        return DayPlanDTO.builder()
                .dayNumber(dayNumber)
                .dayTitle(dayNumber + "일차 추천 일정")
                .items(buildItems(dayNumber))
                .build();
    }

    private List<ScheduleItemDTO> buildItems(int dayNumber) {
        Map<String, Integer> timeSlotCounts = new HashMap<>();

        return ITEM_TEMPLATES.stream()
                .map(template -> {
                    int sequence = timeSlotCounts.merge(template.timeSlot(), 1, Integer::sum);
                    return buildItem(dayNumber, template, sequence);
                })
                .toList();
    }

    private ScheduleItemDTO buildItem(int dayNumber, ItemTemplate template, int sequence) {
        return ScheduleItemDTO.builder()
                .itemKey("day" + dayNumber + "-" + template.timeSlot().toLowerCase() + "-" + sequence)
                .itemType(template.itemType())
                .timeSlot(template.timeSlot())
                .title(template.title())
                .replaceable(true)
                .build();
    }

    private int dayCount(String when) {
        if (when == null || when.isBlank()) {
            return DEFAULT_DAY_COUNT;
        }

        Matcher matcher = DAY_COUNT_PATTERN.matcher(when);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : DEFAULT_DAY_COUNT;
    }

    private record ItemTemplate(String timeSlot, String itemType, String title) {
    }
}
