package com.dreamCollection.trip.ai;

import com.dreamCollection.place.dto.PlaceResponse;
import com.dreamCollection.trip.dto.PlanRequestDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class TripPromptBuilder {

    private static final int MAX_PLACES_IN_PROMPT = 20;

    public String build(PlanRequestDTO request, List<PlaceResponse> places) {
        String placeBlock = formatPlaces(places);

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

                [장소 후보] (이 목록의 placeId만 사용할 것)
                %s

                [출력 규칙]
                - 마크다운/설명 없이 JSON만 출력
                - placeId는 위 후보에 있는 숫자만 사용 (없으면 일정 실패)
                - 여행 기간에 맞는 dayNumber를 채울 것
                - 각 day의 items는 Morning → Lunch → Afternoon → Dinner 순. 각 timeSlot은 1~2개(기본 1개, 테마/강도/페이스에 맞을 때만 2개). 같은 timeSlot은 연속으로 나열
                - title 필드는 넣지 말 것. 서버가 placeId로 장소명을 채움
                - Lunch/Dinner는 RESTAURANT 또는 CAFE placeId만 사용 (필수)
                - Morning/Afternoon는 ATTRACTION, ACTIVITY, NATURE, CULTURE, SHOPPING 등 관광/체험 위주 (RESTAURANT/CAFE를 주 일정으로 넣지 말 것)
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

    private static String formatPlaces(List<PlaceResponse> places) {
        if (places == null || places.isEmpty()) {
            return "(후보 없음)";
        }

        return places.stream()
                .filter(Objects::nonNull)
                .limit(MAX_PLACES_IN_PROMPT)
                .map(p -> "- placeId=%d | name=%s | category=%s | address=%s".formatted(
                        p.id(),
                        nullToEmpty(p.name()),
                        p.category() != null ? p.category().name() : "",
                        nullToEmpty(p.address())
                ))
                .collect(Collectors.joining("\n"));
    }

    private static String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
