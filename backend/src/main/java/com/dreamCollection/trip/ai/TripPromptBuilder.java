package com.dreamCollection.trip.ai;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.trip.TripPlacePools;
import com.dreamCollection.trip.dto.PlanRequestDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TripPromptBuilder {

    public String build(PlanRequestDTO request, List<PlaceResponse> places) {
        return build(request, TripPlacePools.from(places));
    }

    public String build(PlanRequestDTO request, TripPlacePools pools) {
        String placeBlock = formatPools(pools);

        return """
                아래 여행 조건과 장소 후보로 일정을 만들어라.

                [여행 조건]
                동행 유형: %s
                여행 기간: %s
                출발일: %s
                여행 지역: %s
                목적지: %s
                여행 테마: %s
                여행 강도: %s

                %s

                [출력 규칙]
                - 마크다운/설명 없이 JSON만 출력
                - placeId는 위 후보 객체의 id만 사용 (없으면 일정 실패)
                - 여행 기간에 맞는 dayNumber를 채울 것
                - 매일 Morning, Lunch, Afternoon, Dinner만 사용 (Cafe/Night 등 별도 timeSlot 금지)
                - 각 day의 items는 Morning → Lunch → Afternoon → Dinner 순. 각 timeSlot은 1~2개(기본 1개, 테마/강도/페이스에 맞을 때만 2개). 같은 timeSlot은 연속으로 나열
                - title 필드는 넣지 말 것. 서버가 placeId로 장소명·PlaceCategory를 채움
                - category는 Place 카테고리 enum이다 (표시: RESTAURANT=맛집, CAFE=카페, ATTRACTION=관광, ACTIVITY=체험, SHOPPING=쇼핑, NATURE=자연, CULTURE=문화)
                - Cafe 전용 timeSlot은 만들지 말 것. CAFE도 Lunch/Dinner에만 넣는다
                - Lunch/Dinner: 첫 항목은 RESTAURANT(맛집) 우선, 없을 때만 CAFE(카페). mealPlaces에서만 고른다. 관광지를 식사 슬롯 첫 항목에 넣지 말 것
                - CAFE는 같은 Lunch/Dinner 슬롯의 두 번째 항목으로 가능
                - Morning/Afternoon: activityPlaces의 id만 사용. RESTAURANT/CAFE를 넣지 말 것
                - mealPlaces가 비어 있으면 Lunch/Dinner에 장소를 지어내지 말 것 (빈 일정으로 둘 것)
                - 같은 placeId를 반복하지 말 것
                - 후보에 없는 장소를 지어내지 말 것

                [JSON 스키마]
                {
                  "days": [
                    {
                      "dayNumber": 1,
                      "items": [
                        { "timeSlot": "Morning", "placeId": 12 },
                        { "timeSlot": "Morning", "placeId": 15 },
                        { "timeSlot": "Lunch", "placeId": 5 },
                        { "timeSlot": "Afternoon", "placeId": 8 },
                        { "timeSlot": "Dinner", "placeId": 3 }
                      ]
                    }
                  ]
                }
                """.formatted(
                nullToEmpty(request.getWho()),
                nullToEmpty(request.getWhen()),
                request.getStartDate() != null ? request.getStartDate().toString() : "",
                nullToEmpty(request.getRegion()),
                nullToEmpty(request.getDestination()),
                nullToEmpty(request.getTheme()),
                nullToEmpty(request.getLevel()),
                placeBlock
        );
    }

    private static String formatPools(TripPlacePools pools) {
        List<PlaceResponse> mealPlaces = pools != null ? pools.mealPlaces() : List.of();
        List<PlaceResponse> activityPlaces = pools != null ? pools.activityPlaces() : List.of();

        return """
                [mealPlaces] (Lunch/Dinner 전용 — PlaceCategory RESTAURANT·CAFE, Cafe timeSlot 없음)
                %s

                [activityPlaces] (Morning/Afternoon 전용 — ATTRACTION·SHOPPING·NATURE·CULTURE·ACTIVITY)
                %s""".formatted(
                formatPlaceObjects(mealPlaces),
                formatPlaceObjects(activityPlaces)
        );
    }

    private static String formatPlaceObjects(List<PlaceResponse> places) {
        if (places == null || places.isEmpty()) {
            return "(후보 없음)";
        }
        return places.stream()
                .map(TripPromptBuilder::formatPlaceObject)
                .collect(Collectors.joining("\n"));
    }

    private static String formatPlaceObject(PlaceResponse p) {
        StringBuilder sb = new StringBuilder();
        sb.append("{ id: ").append(p.id());
        sb.append(", name: \"").append(escape(nullToEmpty(p.name()))).append('"');
        sb.append(", category: \"").append(p.category() != null ? p.category().name() : "").append('"');
        sb.append(", address: \"").append(escape(nullToEmpty(p.address()))).append('"');
        if (p.imageUrl() != null && !p.imageUrl().isBlank()) {
            sb.append(", imageUrl: \"").append(escape(p.imageUrl())).append('"');
        }
        sb.append(" }");
        return sb.toString();
    }

    private static String escape(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
