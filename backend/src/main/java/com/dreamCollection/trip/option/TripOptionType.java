package com.dreamCollection.trip.option;

import lombok.Getter;

import java.util.List;
import java.util.Arrays;

@Getter
public enum TripOptionType {

    WHO("who", List.of("혼자", "연인과", "친구와", "가족과")),
    WHEN("when", List.of("1박 2일", "2박 3일", "3박 4일", "4박 5일")),
    REGION("region", List.of("일본", "중국", "미국", "아시아")),
    THEME("theme", List.of(
            "맛집·카페",
            "관광·포토스팟",
            "쇼핑",
            "자연·힐링",
            "액티비티",
            "문화·전시·역사"
    )),
    LEVEL("level", List.of("여유로운 일정", "다양한 경험"));

    private final String type;
    private final List<String> options;

    TripOptionType(String type, List<String> options) {
        this.type = type;
        this.options = options;
    }

    public static TripOptionType from(String type) {
        return Arrays.stream(values())
                .filter(optionType -> optionType.type.equals(type))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("잘못된 옵션 타입입니다."));
    }
}