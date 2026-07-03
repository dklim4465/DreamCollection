package com.dreamcollection.domain.main.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateChecklistItemRequest(
        @NotNull(message = "여행 요청 ID가 필요합니다")
        Long requestId,

        @NotBlank(message = "체크리스트 내용을 입력해주세요")
        String content,

        String category
) {
}
