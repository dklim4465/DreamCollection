package com.dreamCollection.trip.recommend;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.trip.TripPlacePools;
import com.dreamCollection.trip.ai.TripAiDayPlan;
import com.dreamCollection.trip.ai.TripAiGenerateData;
import com.dreamCollection.trip.ai.TripAiScheduleItem;
import com.dreamCollection.trip.dto.DayPlanDTO;
import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.ScheduleItemDTO;
import com.dreamCollection.trip.dto.TripRecommendDTO;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
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
    private static final Pattern DAY_COUNT_PATTERN = Pattern.compile("(\\d+)");

    private static final List<String> REQUIRED_SLOTS =
            List.of("Morning", "Lunch", "Afternoon", "Dinner");
    private static final List<String> MEAL_SLOTS = List.of("Lunch", "Dinner");
    private static final List<String> ACTIVITY_SLOTS = List.of("Morning", "Afternoon");

    private record MappedItem(ScheduleItemDTO item, Long placeId) {
    }

    public List<TripRecommendDTO> build(
            PlanRequestDTO request,
            TripAiGenerateData aiData,
            List<PlaceResponse> places
    ) {
        return build(request, aiData, TripPlacePools.from(places));
    }

    public List<TripRecommendDTO> build(
            PlanRequestDTO request,
            TripAiGenerateData aiData,
            TripPlacePools pools
    ) {
        if (pools == null || pools.allPlaces().isEmpty()) {
            log.warn("Place pools are empty. Trip recommendation failed.");
            return List.of();
        }
        if (pools.mealEmpty()) {
            log.warn("Meal place pool is empty. Cannot enforce Lunch/Dinner.");
            return List.of();
        }

        int expectedDayCount = dayCount(request.getWhen());
        List<DayPlanDTO> dayPlans = mapAiDays(aiData, pools, expectedDayCount);

        if (dayPlans.isEmpty() || !isValidSchedule(dayPlans, expectedDayCount)) {
            log.warn("AI schedule validation failed or place matching failed.");
            return List.of();
        }

        String region = request.getDestination() != null && !request.getDestination().isBlank()
                ? request.getDestination()
                : request.getRegion();

        return List.of(TripRecommendDTO.builder()
                .recommendation(1)
                .title((region != null ? region : "Trip") + " recommended itinerary")
                .summary(nullToEmpty(request.getWhen()) + " "
                        + nullToEmpty(request.getTheme()) + " recommended itinerary")
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
                        && hasMealFirstInMealSlots(day.getItems())
                        && hasActivityOnlyInActivitySlots(day.getItems())
                        && day.getItems().stream().allMatch(this::isPlaceFilledItem)
        );
    }

    private boolean isPlaceFilledItem(ScheduleItemDTO item) {
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

    /** Lunch/Dinner 각 슬롯의 첫 항목이 Meal인지 검증 */
    private boolean hasMealFirstInMealSlots(List<ScheduleItemDTO> items) {
        for (String mealSlot : MEAL_SLOTS) {
            ScheduleItemDTO first = items.stream()
                    .filter(item -> mealSlot.equalsIgnoreCase(item.getTimeSlot()))
                    .findFirst()
                    .orElse(null);
            if (first == null || !isMealItem(first)) {
                return false;
            }
        }
        return true;
    }

    /** Morning/Afternoon에 Meal이 없는지 검증 */
    private boolean hasActivityOnlyInActivitySlots(List<ScheduleItemDTO> items) {
        for (ScheduleItemDTO item : items) {
            if (item == null || item.getTimeSlot() == null) {
                continue;
            }
            String slot = normalizeSlot(item.getTimeSlot());
            if (slot != null && ACTIVITY_SLOTS.contains(slot) && isMealItem(item)) {
                return false;
            }
        }
        return true;
    }

    private List<DayPlanDTO> mapAiDays(
            TripAiGenerateData aiData,
            TripPlacePools pools,
            int expectedDayCount
    ) {
        if (aiData == null || aiData.days() == null || aiData.days().isEmpty()) {
            return List.of();
        }

        Map<Long, PlaceResponse> placeById = pools.allPlaces().stream()
                .filter(p -> p != null && p.id() != null)
                .collect(Collectors.toMap(
                        PlaceResponse::id,
                        Function.identity(),
                        (a, b) -> a
                ));

        Set<Long> mealPlaceIds = pools.mealPlaces().stream()
                .filter(p -> p != null && p.id() != null)
                .map(PlaceResponse::id)
                .collect(Collectors.toSet());
        Set<Long> activityPlaceIds = pools.activityPlaces().stream()
                .filter(p -> p != null && p.id() != null)
                .map(PlaceResponse::id)
                .collect(Collectors.toSet());

        if (placeById.isEmpty()) {
            return List.of();
        }

        Set<Long> usedPlaceIds = new HashSet<>();
        List<DayPlanDTO> result = new ArrayList<>();

        for (TripAiDayPlan day : aiData.days()) {
            int dayNumber = day.dayNumber() != null
                    ? day.dayNumber()
                    : result.size() + 1;
            List<MappedItem> mapped = mapItems(
                    day.items(),
                    dayNumber,
                    placeById,
                    mealPlaceIds,
                    activityPlaceIds,
                    usedPlaceIds
            );
            List<ScheduleItemDTO> items = enforceMealSlots(
                    mapped,
                    dayNumber,
                    usedPlaceIds,
                    pools.mealPlaces()
            );
            if (items.isEmpty() || !hasRequiredSlots(items)) {
                return List.of();
            }
            result.add(DayPlanDTO.builder()
                    .dayNumber(dayNumber)
                    .dayTitle(dayNumber + " day recommended itinerary")
                    .items(items)
                    .build());
        }

        if (result.size() > expectedDayCount) {
            return result.subList(0, expectedDayCount);
        }
        return result;
    }

    private List<MappedItem> mapItems(
            List<TripAiScheduleItem> aiItems,
            int dayNumber,
            Map<Long, PlaceResponse> placeById,
            Set<Long> mealPlaceIds,
            Set<Long> activityPlaceIds,
            Set<Long> usedPlaceIds
    ) {
        if (aiItems == null || aiItems.isEmpty()) {
            return List.of();
        }

        Map<String, Integer> timeSlotCounts = new HashMap<>();
        List<MappedItem> items = new ArrayList<>();

        for (TripAiScheduleItem item : aiItems) {
            if (item == null || item.timeSlot() == null || item.timeSlot().isBlank()
                    || item.placeId() == null) {
                continue;
            }

            if (!usedPlaceIds.add(item.placeId())) {
                continue;
            }

            PlaceResponse place = placeById.get(item.placeId());
            if (place == null) {
                usedPlaceIds.remove(item.placeId());
                continue;
            }

            String timeSlot = normalizeSlot(item.timeSlot());
            if (timeSlot == null) {
                usedPlaceIds.remove(item.placeId());
                continue;
            }

            if (!isAllowedForSlot(timeSlot, item.placeId(), mealPlaceIds, activityPlaceIds)) {
                usedPlaceIds.remove(item.placeId());
                continue;
            }

            int sequence = timeSlotCounts.merge(timeSlot, 1, Integer::sum);

            ScheduleItemDTO dto = hydrateFromPlace(place, timeSlot, dayNumber, sequence);
            items.add(new MappedItem(dto, place.id()));
        }

        return items;
    }

    /**
     * Lunch/Dinner: meal pool만. Morning/Afternoon: activity pool만.
     * (식사 슬롯 첫 항목 강제·activity 슬롯 meal 제거는 enforce에서 재검증)
     */
    private static boolean isAllowedForSlot(
            String timeSlot,
            Long placeId,
            Set<Long> mealPlaceIds,
            Set<Long> activityPlaceIds
    ) {
        if (MEAL_SLOTS.contains(timeSlot)) {
            return mealPlaceIds.contains(placeId);
        }
        if (ACTIVITY_SLOTS.contains(timeSlot)) {
            return activityPlaceIds.contains(placeId);
        }
        return false;
    }

    private static ScheduleItemDTO hydrateFromPlace(
            PlaceResponse place,
            String timeSlot,
            int dayNumber,
            int sequence
    ) {
        return ScheduleItemDTO.builder()
                .itemKey("day" + dayNumber + "-" + timeSlot.toLowerCase(Locale.ROOT) + "-" + sequence)
                .itemType(resolveItemType(place))
                .placeCategory(place.category() != null ? place.category().name() : null)
                .timeSlot(timeSlot)
                .title(place.name())
                .description(place.description())
                .address(place.address())
                .imageUrl(place.imageUrl())
                .replaceable(true)
                .build();
    }

    /**
     * Lunch/Dinner 첫 항목이 반드시 식사(RESTAURANT 우선, 없으면 CAFE)가 되도록 강제.
     * Morning/Afternoon에서 식사 카테고리를 제거.
     * 실패 시 빈 리스트 반환.
     */
    private List<ScheduleItemDTO> enforceMealSlots(
            List<MappedItem> dayItems,
            int dayNumber,
            Set<Long> usedPlaceIds,
            List<PlaceResponse> mealPlaces
    ) {
        Map<String, List<MappedItem>> bySlot = new LinkedHashMap<>();
        for (String slot : REQUIRED_SLOTS) {
            bySlot.put(slot, new ArrayList<>());
        }

        for (MappedItem mapped : dayItems) {
            String slot = normalizeSlot(mapped.item().getTimeSlot());
            if (slot != null && bySlot.containsKey(slot)) {
                bySlot.get(slot).add(mapped);
            }
        }

        for (String activitySlot : ACTIVITY_SLOTS) {
            stripMealsFromActivitySlot(bySlot.get(activitySlot), usedPlaceIds);
        }

        for (String mealSlot : MEAL_SLOTS) {
            if (!ensureMealFirst(
                    bySlot.get(mealSlot),
                    mealSlot,
                    dayNumber,
                    usedPlaceIds,
                    mealPlaces
            )) {
                log.warn("No unused meal place left for day {} {}", dayNumber, mealSlot);
                return List.of();
            }
        }

        return reassembleDayItems(bySlot, dayNumber);
    }

    /** Morning/Afternoon에서 식사 카테고리를 제거 (있으면) */
    private void stripMealsFromActivitySlot(List<MappedItem> slotItems, Set<Long> usedPlaceIds) {
        slotItems.removeIf(mapped -> {
            if (!isMealItem(mapped.item())) {
                return false;
            }
            usedPlaceIds.remove(mapped.placeId());
            return true;
        });
    }

    /**
     * 슬롯 첫 항목이 Meal이 되도록 보장.
     * 첫 항목이 CAFE이면 unused RESTAURANT로 업그레이드(식당 우선).
     * @return false if meal place를 채울 수 없음
     */
    private boolean ensureMealFirst(
            List<MappedItem> slotItems,
            String mealSlot,
            int dayNumber,
            Set<Long> usedPlaceIds,
            List<PlaceResponse> mealPlaces
    ) {
        int existingMealIndex = -1;
        for (int i = 0; i < slotItems.size(); i++) {
            if (isMealItem(slotItems.get(i).item())) {
                existingMealIndex = i;
                break;
            }
        }

        if (existingMealIndex > 0) {
            MappedItem meal = slotItems.remove(existingMealIndex);
            slotItems.add(0, meal);
        } else if (existingMealIndex < 0) {
            PlaceResponse mealPlace = pickNextMeal(mealPlaces, usedPlaceIds);
            if (mealPlace == null) {
                return false;
            }
            usedPlaceIds.add(mealPlace.id());
            ScheduleItemDTO dto = hydrateFromPlace(mealPlace, mealSlot, dayNumber, 1);
            slotItems.add(0, new MappedItem(dto, mealPlace.id()));
            return true;
        }

        upgradeCafeFirstToRestaurant(slotItems, mealSlot, dayNumber, usedPlaceIds, mealPlaces);
        return true;
    }

    /**
     * 첫 항목이 CAFE이면 unused RESTAURANT를 앞에 넣고, 카페는 2번째로 유지(슬롯 최대 2).
     * RESTAURANT가 없으면 CAFE 유지.
     */
    private void upgradeCafeFirstToRestaurant(
            List<MappedItem> slotItems,
            String mealSlot,
            int dayNumber,
            Set<Long> usedPlaceIds,
            List<PlaceResponse> mealPlaces
    ) {
        if (slotItems.isEmpty()) {
            return;
        }
        MappedItem first = slotItems.get(0);
        if (!isMealItem(first.item()) || !isCafePlace(first.placeId(), mealPlaces)) {
            return;
        }

        PlaceResponse restaurant = pickNextRestaurant(mealPlaces, usedPlaceIds);
        if (restaurant == null) {
            return;
        }

        usedPlaceIds.add(restaurant.id());
        ScheduleItemDTO dto = hydrateFromPlace(restaurant, mealSlot, dayNumber, 1);
        slotItems.add(0, new MappedItem(dto, restaurant.id()));

        while (slotItems.size() > 2) {
            MappedItem removed = slotItems.remove(slotItems.size() - 1);
            usedPlaceIds.remove(removed.placeId());
        }
    }

    private static boolean isCafePlace(Long placeId, List<PlaceResponse> mealPlaces) {
        if (placeId == null || mealPlaces == null) {
            return false;
        }
        for (PlaceResponse place : mealPlaces) {
            if (place != null && placeId.equals(place.id())) {
                return place.category() == PlaceCategory.CAFE;
            }
        }
        return false;
    }

    /** unused RESTAURANT만. 없으면 null. */
    private PlaceResponse pickNextRestaurant(List<PlaceResponse> mealPlaces, Set<Long> usedPlaceIds) {
        if (mealPlaces == null || mealPlaces.isEmpty()) {
            return null;
        }
        for (PlaceResponse place : mealPlaces) {
            if (place == null || place.id() == null || place.category() == null) {
                continue;
            }
            if (usedPlaceIds.contains(place.id())) {
                continue;
            }
            if (place.category() == PlaceCategory.RESTAURANT) {
                return place;
            }
        }
        return null;
    }

    /** RESTAURANT 우선, 없으면 CAFE. usedPlaceIds에 없는 것만. mealPlaces 풀에서만 선택. */
    private PlaceResponse pickNextMeal(List<PlaceResponse> mealPlaces, Set<Long> usedPlaceIds) {
        if (mealPlaces == null || mealPlaces.isEmpty()) {
            return null;
        }
        PlaceResponse restaurant = pickNextRestaurant(mealPlaces, usedPlaceIds);
        if (restaurant != null) {
            return restaurant;
        }
        for (PlaceResponse place : mealPlaces) {
            if (place == null || place.id() == null || place.category() == null) {
                continue;
            }
            if (usedPlaceIds.contains(place.id())) {
                continue;
            }
            if (place.category() == PlaceCategory.CAFE) {
                return place;
            }
        }
        return null;
    }

    private List<ScheduleItemDTO> reassembleDayItems(
            Map<String, List<MappedItem>> bySlot,
            int dayNumber
    ) {
        List<ScheduleItemDTO> result = new ArrayList<>();
        for (String slot : REQUIRED_SLOTS) {
            List<MappedItem> slotItems = bySlot.getOrDefault(slot, List.of());
            int sequence = 1;
            for (MappedItem mapped : slotItems) {
                ScheduleItemDTO item = mapped.item();
                item.setTimeSlot(slot);
                item.setItemKey("day" + dayNumber + "-" + slot.toLowerCase(Locale.ROOT) + "-" + sequence);
                result.add(item);
                sequence++;
            }
        }
        return result;
    }

    private static boolean isMealItem(ScheduleItemDTO item) {
        return item != null && "Meal".equalsIgnoreCase(item.getItemType());
    }

    private static String normalizeSlot(String timeSlot) {
        if (timeSlot == null || timeSlot.isBlank()) {
            return null;
        }
        String trimmed = timeSlot.trim();
        for (String required : REQUIRED_SLOTS) {
            if (required.equalsIgnoreCase(trimmed)) {
                return required;
            }
        }
        return null;
    }

    /** itemType은 Place.category에서만 결정 */
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
