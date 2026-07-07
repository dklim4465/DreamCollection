package com.dreamCollection.main.dto;

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
        List<HeroMedia> medias // 배경이 여러 개면 전부 내려줘서 프론트가 슬라이드로 순환 (MONTHLY는 여행지별 제목도 함께)
) {
    // title/subtitle은 MONTHLY 모드에서 슬라이드별 문구 교체용 (SCHEDULE/DEFAULT는 null로 두고 최상단 title/subtitle 사용)
    public record HeroMedia(String url, String type, String title, String subtitle) {
        public HeroMedia(String url, String type) {
            this(url, type, null, null);
        }
    }
}
