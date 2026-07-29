package com.dreamCollection.user.entity;

/**
 * mate_post.travel_style(String, 한글 라벨)과 매칭하기 위해 각 enum 상수에 한글 라벨을 매핑한다.
 * ADVENTURE는 모집글 쪽에 대응하는 라벨이 없어 임시로 "액티비티"에 매핑함
 * (추후 모집글 성향 옵션에 "모험"이 별도로 생기면 분리 필요).
 */
public enum TravelStyle {
    RELAXED("힐링"),
    ACTIVE("액티비티"),
    CULTURE("문화/역사"),
    FOOD("맛집"),
    ADVENTURE("액티비티"); // 임시 매핑 — 모집글에 대응 라벨 없음

    private final String label;

    TravelStyle(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}