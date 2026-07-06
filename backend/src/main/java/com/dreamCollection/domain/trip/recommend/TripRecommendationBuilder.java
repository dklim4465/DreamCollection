package com.dreamcollection.domain.trip.recommend;

import com.dreamcollection.domain.trip.dto.*;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class TripRecommendationBuilder {

    // ai로 받아오면 일정을 생성해주는 이곳에서의 메인 메서드
    public List<TripRecommendDTO> build(PlanRequestDTO planRequestDTO, String aiResult){
        int dayCount = dayCount(planRequestDTO.getWhen());

        return List.of(TripRecommendDTO.builder()
                        .recommendation(1)
                        .title(planRequestDTO.getRegion()+ " 추천 일정 ")
                        .summary(planRequestDTO.getWhen() + " " + planRequestDTO.getTheme() + " 추천 일정입니다.")
                        .days(buildDays(dayCount))
                .build());
    }

    // 몇일까지 있는지 받아와서 그만큼만 생성해주기
    private List<DayPlanDTO> buildDays(int dayCount) {
        return java.util.stream.IntStream.rangeClosed(1, dayCount)
                .mapToObj(this::buildDay)
                .toList();
    }

    // 일차별로 크게 4개로 나눠서 일정을 생성
    private DayPlanDTO buildDay(int dayNumber) {
        return DayPlanDTO.builder()
                .dayNumber(dayNumber)
                .dayTitle(dayNumber + "일차 추천 일정")
                .items(List.of(
                        buildItem(dayNumber, "Morning", "Activity","오전관광"),
                        buildItem(dayNumber, "Lunch","Meal","점식식사"),
                        buildItem(dayNumber,"Afternoon","Activity","오후 일정"),
                        buildItem(dayNumber, "Dinner","Meal","저녁식사")
                ))
                .build();
    }

    // 이걸 기본 틀로 사용해서 일정을 만든다.
    private ScheduleItemDTO buildItem(int dayNumber, String timeSlot, String itemType, String title) {
        return ScheduleItemDTO.builder()
                .itemKey("day" + dayNumber + "-" + timeSlot.toLowerCase())
                .itemType(itemType)
                .timeSlot(timeSlot)
                .title(title)
                .options(buildPlaceOptions(dayNumber, itemType, title))
                .selectedOptionIndex(0)
                .replaceable(true)
                .build();
    }

    // 일정, 장소 등등 하나씩 나오는 구조의 틀
    private List<PlaceOptionDTO> buildPlaceOptions(int dayNumber, String itemType, String title){
                                        // 후보 개수를 늘리고 싶을때 아래 숫자만 변경하면됨
                                        // (1,3) -> (1,5)면 3개에서 5개로됨
        return java.util.stream.IntStream.rangeClosed(1,3).mapToObj(optionOrder -> buildPlaceOption(
                optionOrder,
                title + "후보" + optionOrder,
                itemType,
                dayNumber + "일차 " + title + " " + optionOrder + "번째 후보입니다."
        )).toList();
    }

    // 몇일차까지 있는지 계산 해주는 곳
    private int dayCount(String when) {
        if (when == null || when.isBlank()) {
            return 1;
        }

        java.util.regex.Matcher matcher = java.util.regex.Pattern.compile("(\\d+)일").matcher(when);

        if (matcher.find()){
            return Integer.parseInt(matcher.group(1));
        }

        return 1;
    }

    private PlaceOptionDTO buildPlaceOption(int option, String placeName, String category, String description){
        return PlaceOptionDTO.builder()
                .option(option)
                .placeName(placeName)
                .category(category)
                .description(description)
                .build();
    }


}
