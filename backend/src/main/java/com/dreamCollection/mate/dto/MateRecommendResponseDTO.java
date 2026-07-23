package com.dreamCollection.mate.dto;

import java.util.List;

/**
 * /api/mate/recommend 응답 전체를 감싸는 DTO.
 * aiStatus로 AI 호출이 정상이었는지, 실패해서 규칙 기반 폴백을 썼는지,
 * Gemini 쿼터 초과(rate limit)로 실패했는지를 프론트에 구분해서 전달한다.
 *
 * aiStatus 값:
 *  - "AI_OK": AI가 정상적으로 추천을 생성함 (혹은 애초에 후보가 없어서 AI를 호출하지 않음)
 *  - "AI_FALLBACK": AI 응답 파싱 실패 등으로 규칙 기반 폴백을 사용함
 *  - "AI_RATE_LIMITED": Gemini API 쿼터 초과(429)로 AI 호출이 실패해 폴백을 사용함
 *  - "AI_ERROR": rate limit 외의 이유로 AI 호출이 실패해 폴백을 사용함
 */
public record MateRecommendResponseDTO(
        List<MateRecommendItemDTO> items,
        String aiStatus
) {
    public static MateRecommendResponseDTO of(List<MateRecommendItemDTO> items, String aiStatus) {
        return new MateRecommendResponseDTO(items, aiStatus);
    }
}