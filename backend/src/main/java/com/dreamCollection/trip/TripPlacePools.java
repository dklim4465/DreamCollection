package com.dreamCollection.trip;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.place.entity.PlaceCategory;

import java.util.ArrayList;
import java.util.EnumMap;
import java.util.EnumSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Stream;

/**
 * Prompt builder와 recommendation builder가 공유하는 장소 후보 풀.
 * Lunch/Dinner = mealPlaces, Morning/Afternoon = activityPlaces.
 * <p>
 * FE {@code PlaceSuggestionList} 탭과 동일한 PlaceCategory 택소노미를 따른다.
 * <ul>
 *   <li>mealPlaces ≈ meal 탭: RESTAURANT + CAFE</li>
 *   <li>activityPlaces ≈ schedule 탭 핵심 + experience(ACTIVITY):
 *       ATTRACTION, SHOPPING, NATURE, CULTURE, ACTIVITY
 *       (TRANSPORT/HOTEL은 별도 플로우라 Morning/Afternoon AI 풀에서 제외)</li>
 * </ul>
 * 풀은 카테고리별 쿼터로 샘플링하며, description이 있는 장소를 우선한다.
 */
public record TripPlacePools(
        List<PlaceResponse> mealPlaces,
        List<PlaceResponse> activityPlaces
) {
    /** Lunch/Dinner 전용: PlaceSuggestionList meal 탭과 동일 */
    private static final int MAX_MEAL_PLACES = 10;
    /** Morning/Afternoon 전용: schedule + experience 패널 카테고리 */
    private static final int MAX_ACTIVITY_PLACES = 12;

    private static final Set<PlaceCategory> MEAL_CATEGORIES = EnumSet.of(
            PlaceCategory.RESTAURANT,
            PlaceCategory.CAFE
    );
    private static final Set<PlaceCategory> ACTIVITY_CATEGORIES = EnumSet.of(
            PlaceCategory.ATTRACTION,
            PlaceCategory.SHOPPING,
            PlaceCategory.NATURE,
            PlaceCategory.CULTURE,
            PlaceCategory.ACTIVITY
    );

    /** mealPlaces 카테고리별 목표 쿼터 (합계 = MAX_MEAL_PLACES) */
    private static final Map<PlaceCategory, Integer> MEAL_QUOTAS = Map.of(
            PlaceCategory.RESTAURANT, 7,
            PlaceCategory.CAFE, 3
    );

    /** activityPlaces 카테고리별 목표 쿼터 (합계 = MAX_ACTIVITY_PLACES) */
    private static final Map<PlaceCategory, Integer> ACTIVITY_QUOTAS = Map.of(
            PlaceCategory.ATTRACTION, 3,
            PlaceCategory.CULTURE, 3,
            PlaceCategory.NATURE, 2,
            PlaceCategory.SHOPPING, 2,
            PlaceCategory.ACTIVITY, 2
    );

    public static TripPlacePools from(List<PlaceResponse> places) {
        if (places == null || places.isEmpty()) {
            return new TripPlacePools(List.of(), List.of());
        }

        List<PlaceResponse> valid = places.stream()
                .filter(Objects::nonNull)
                .toList();

        return new TripPlacePools(
                List.copyOf(sampleByQuotas(valid, MEAL_CATEGORIES, MEAL_QUOTAS, MAX_MEAL_PLACES)),
                List.copyOf(sampleByQuotas(valid, ACTIVITY_CATEGORIES, ACTIVITY_QUOTAS, MAX_ACTIVITY_PLACES))
        );
    }

    public List<PlaceResponse> allPlaces() {
        return Stream.concat(mealPlaces.stream(), activityPlaces.stream()).toList();
    }

    public boolean mealEmpty() {
        return mealPlaces == null || mealPlaces.isEmpty();
    }

    public boolean activityEmpty() {
        return activityPlaces == null || activityPlaces.isEmpty();
    }

    /**
     * 카테고리별 쿼터로 샘플링한다.
     * 1) 각 카테고리에서 description 우선으로 쿼터만큼 채움
     * 2) 부족하면 같은 풀의 다른 카테고리 leftover로 채움 (역시 description 우선)
     * 입력 리스트의 상대 순서는 description 그룹 내에서 유지한다.
     */
    private static List<PlaceResponse> sampleByQuotas(
            List<PlaceResponse> places,
            Set<PlaceCategory> allowedCategories,
            Map<PlaceCategory, Integer> quotas,
            int totalLimit
    ) {
        Map<PlaceCategory, List<PlaceResponse>> byCategory = new EnumMap<>(PlaceCategory.class);
        for (PlaceResponse place : places) {
            PlaceCategory category = place.category();
            if (category == null || !allowedCategories.contains(category)) {
                continue;
            }
            byCategory.computeIfAbsent(category, ignored -> new ArrayList<>()).add(place);
        }

        LinkedHashSet<Long> selectedIds = new LinkedHashSet<>();
        List<PlaceResponse> selected = new ArrayList<>();

        for (PlaceCategory category : allowedCategories) {
            int quota = quotas.getOrDefault(category, 0);
            if (quota <= 0) {
                continue;
            }
            List<PlaceResponse> ranked = preferDescribed(
                    byCategory.getOrDefault(category, List.of())
            );
            int taken = 0;
            for (PlaceResponse place : ranked) {
                if (taken >= quota || selected.size() >= totalLimit) {
                    break;
                }
                if (place.id() != null && selectedIds.add(place.id())) {
                    selected.add(place);
                    taken++;
                }
            }
        }

        if (selected.size() < totalLimit) {
            List<PlaceResponse> leftovers = new ArrayList<>();
            for (PlaceResponse place : places) {
                PlaceCategory category = place.category();
                if (category == null || !allowedCategories.contains(category)) {
                    continue;
                }
                if (place.id() != null && !selectedIds.contains(place.id())) {
                    leftovers.add(place);
                }
            }
            for (PlaceResponse place : preferDescribed(leftovers)) {
                if (selected.size() >= totalLimit) {
                    break;
                }
                if (selectedIds.add(place.id())) {
                    selected.add(place);
                }
            }
        }

        return selected;
    }

    /** description이 비어 있지 않은 장소를 앞에 두고, 각 그룹 내에서는 입력 순서를 유지한다. */
    private static List<PlaceResponse> preferDescribed(List<PlaceResponse> places) {
        List<PlaceResponse> withDescription = new ArrayList<>();
        List<PlaceResponse> withoutDescription = new ArrayList<>();
        for (PlaceResponse place : places) {
            if (hasDescription(place)) {
                withDescription.add(place);
            } else {
                withoutDescription.add(place);
            }
        }
        List<PlaceResponse> ranked = new ArrayList<>(withDescription.size() + withoutDescription.size());
        ranked.addAll(withDescription);
        ranked.addAll(withoutDescription);
        return ranked;
    }

    private static boolean hasDescription(PlaceResponse place) {
        String description = place.description();
        return description != null && !description.isBlank();
    }
}
