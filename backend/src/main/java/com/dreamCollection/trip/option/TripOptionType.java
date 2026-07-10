package com.dreamCollection.trip.option;

import lombok.Getter;

import java.util.List;
import java.util.Arrays;

@Getter
public enum TripOptionType {

    WHO("who", List.of("혼자", "친구와", "가족과", "연인과")),
    WHEN("when", List.of("1박 2일", "2박 3일", "3박 4일", "4박 5일")),
    REGION("region", List.of("일본", "중국", "미국", "아시아")),
    THEME("theme", List.of("액티비티", "휴양", "기타")),
    LEVEL("level", List.of("여유여행", "빡센여행"));

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