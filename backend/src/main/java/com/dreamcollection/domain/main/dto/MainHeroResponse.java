package com.dreamcollection.domain.main.dto;

import java.util.List;

/**
 * 메인페이지 상단 배경 응답.
 * mode로 어떤 케이스인지 구분 (프론트에서 문구/버튼 분기용)
 */
public record MainHeroResponse(
        String mode,          // "SCHEDULE" | "MONTHLY" | "DEFAULT"
        String imageUrl,      // 대표 이미지(썸네일/공유 등에 사용, 항상 값 있음)
        String mediaType,     // "IMAGE" | "VIDEO" — imageUrl(대표 미디어)의 타입
        String title,
        String subtitle,
        Long tripRequestId,   // mode=SCHEDULE 일 때만 값 있음 (상세 이동용)
        List<HeroMedia> medias // DEFAULT 모드에서 배경이 여러 개면 전부 내려줌 (프론트 슬라이드 연출용)
) {
    public record HeroMedia(String url, String type) {
    }
}
