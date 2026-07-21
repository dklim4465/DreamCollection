package com.dreamCollection.trip.recommend;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.trip.dto.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Log4j2
@Component
public class TripRecommendationBuilder {

    private static final int DEFAULT_DAY_COUNT = 1;
    private static final Pattern DAY_COUNT_PATTERN = Pattern.compile("(\\d+)일");
    private static final Pattern JSON_BLOCK_PATTERN =
            Pattern.compile("```(?:json)?\\s*([\\s\\S]*?)```", Pattern.CASE_INSENSITIVE);

    private static final List<String> REQUIRED_SLOTS =
            List.of("Morning", "Lunch", "Afternoon", "Dinner");

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<TripRecommendDTO> build(
            PlanRequestDTO request,
            String aiResult,
            List<PlaceResponse> places
    ) {
        if (places == null || places.isEmpty()) {
            log.warn("Place 후보 없음 → 일정 생성 실패");
            return List.of();
        }

        int expectedDayCount = dayCount(request.getWhen());
        List<DayPlanDTO> dayPlans = parseAiDays(aiResult, places, expectedDayCount);

        if (dayPlans.isEmpty() || !isValidSchedule(dayPlans, expectedDayCount)) {
            log.warn("AI 일정 파싱 실패 또는 Place 미매칭");
            return List.of();
        }

        String region = request.getDestination() != null && !request.getDestination().isBlank()
                ? request.getDestination()
                : request.getRegion();

        return List.of(TripRecommendDTO.builder()
                .recommendation(1)
                .title((region != null ? region : "여행") + " 추천 일정")
                .summary(nullToEmpty(request.getWhen()) + " "
                        + nullToEmpty(request.getTheme()) + " 추천 일정입니다.")
                .days(dayPlans)
                .build());
    }

    private boolean isValidSchedule(List<DayPlanDTO> dayPlans, int expectedDayCount) {
        if (dayPlans.size() < expectedDayCount) {
            return false;
        }
        return dayPlans.stream().allMatch(day ->
                day.getItems() != null
                        && hasRequiredSlots(day.getItems())
                        && day.getItems().stream().allMatch(this::isPlaceFilledItem)
        );
    }

    private boolean isPlaceFilledItem(ScheduleItemDTO item) {
        // Place.name()만 채워져도 성공. address/image는 없을 수 있음
        return item.getTitle() != null && !item.getTitle().isBlank();
    }

    private boolean hasRequiredSlots(List<ScheduleItemDTO> items) {
        Set<String> slots = items.stream()
                .map(ScheduleItemDTO::getTimeSlot)
                .filter(slot -> slot != null && !slot.isBlank())
                .map(slot -> slot.toLowerCase(Locale.ROOT))
                .collect(Collectors.toSet());
        return REQUIRED_SLOTS.stream()
                .map(slot -> slot.toLowerCase(Locale.ROOT))
                .allMatch(slots::contains);
    }

    private List<DayPlanDTO> parseAiDays(
            String aiResult,
            List<PlaceResponse> places,
            int expectedDayCount
    ) {
        if (aiResult == null || aiResult.isBlank() || aiResult.startsWith("AI_")) {
            return List.of();
        }

        Map<Long, PlaceResponse> placeById = places.stream()
                .filter(p -> p != null && p.id() != null)
                .collect(Collectors.toMap(
                        PlaceResponse::id,
                        Function.identity(),
                        (a, b) -> a
                ));

        if (placeById.isEmpty()) {
            return List.of();
        }

        try {
            JsonNode root = objectMapper.readTree(extractJson(aiResult));
            JsonNode daysNode = root.path("days");
            if (!daysNode.isArray() || daysNode.isEmpty()) {
                return List.of();
            }

            Set<Long> usedPlaceIds = new HashSet<>();
            List<DayPlanDTO> result = new ArrayList<>();

            for (JsonNode dayNode : daysNode) {
                int dayNumber = dayNode.path("dayNumber").asInt(result.size() + 1);
                List<ScheduleItemDTO> items = parseItems(
                        dayNode.path("items"),
                        dayNumber,
                        placeById,
                        usedPlaceIds
                );
                if (!hasRequiredSlots(items)) {
                    return List.of();
                }
                result.add(DayPlanDTO.builder()
                        .dayNumber(dayNumber)
                        .dayTitle(dayNumber + "일차 추천 일정")
                        .items(items)
                        .build());
            }

            if (result.size() > expectedDayCount) {
                return result.subList(0, expectedDayCount);
            }
            return result;
        } catch (Exception e) {
            log.warn("AI JSON 파싱 실패: {}", e.getMessage());
            return List.of();
        }
    }

    private List<ScheduleItemDTO> parseItems(
            JsonNode itemsNode,
            int dayNumber,
            Map<Long, PlaceResponse> placeById,
            Set<Long> usedPlaceIds
    ) {
        if (!itemsNode.isArray()) {
            return List.of();
        }

        Map<String, Integer> timeSlotCounts = new HashMap<>();
        List<ScheduleItemDTO> items = new ArrayList<>();

        for (JsonNode itemNode : itemsNode) {
            String timeSlot = itemNode.path("timeSlot").asText("").trim();
            if (timeSlot.isEmpty()) {
                continue;
            }

            if (!itemNode.hasNonNull("placeId")) {
                continue;
            }

            long placeId = itemNode.get("placeId").asLong();
            PlaceResponse place = placeById.get(placeId);
            if (place == null) {
                continue;
            }

            usedPlaceIds.add(placeId);
            int sequence = timeSlotCounts.merge(timeSlot, 1, Integer::sum);

            items.add(ScheduleItemDTO.builder()
                    .itemKey("day" + dayNumber + "-" + timeSlot.toLowerCase(Locale.ROOT) + "-" + sequence)
                    .itemType(resolveItemType(place))
                    .timeSlot(timeSlot)
                    .title(place.name())
                    .description(place.description())
                    .address(place.address())
                    .imageUrl(place.imageUrl())
                    .replaceable(true)
                    .build());
        }

        return items;
    }

    private static String resolveItemType(PlaceResponse place) {
        if (place.category() == null) {
            return "Activity";
        }
        return switch (place.category()) {
            case RESTAURANT, CAFE -> "Meal";
            case ACTIVITY -> "Experience";
            case TRANSPORT -> "Transport";
            case HOTEL -> "Hotel";
            case ATTRACTION, SHOPPING, NATURE, CULTURE -> "Activity";
        };
    }

    private String extractJson(String raw) {
        String trimmed = raw.trim();
        Matcher matcher = JSON_BLOCK_PATTERN.matcher(trimmed);
        if (matcher.find()) {
            return matcher.group(1).trim();
        }
        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start >= 0 && end > start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    private int dayCount(String when) {
        if (when == null || when.isBlank()) {
            return DEFAULT_DAY_COUNT;
        }
        Matcher matcher = DAY_COUNT_PATTERN.matcher(when);
        return matcher.find() ? Integer.parseInt(matcher.group(1)) : DEFAULT_DAY_COUNT;
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
