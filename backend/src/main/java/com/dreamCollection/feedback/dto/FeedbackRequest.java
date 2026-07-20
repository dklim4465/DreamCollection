package com.dreamCollection.feedback.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 하단 "문의하기" 버튼 → 건의사항/버그신고 폼에서 보내는 요청.
 * 로그인 여부와 무관하게 누구나 보낼 수 있음 (비로그인 방문자도 문제를 신고할 수 있어야 하므로).
 */
public record FeedbackRequest(
        @NotBlank(message = "이름을 입력해주세요")
        @Size(max = 50)
        String name,

        @NotBlank(message = "답장받을 이메일을 입력해주세요")
        @Email(message = "올바른 이메일 형식이 아니에요")
        String email,

        @NotBlank(message = "카테고리를 선택해주세요")
        String category, // BUG(버그 신고) | SUGGESTION(건의사항) | ETC(기타)

        @NotBlank(message = "내용을 입력해주세요")
        @Size(max = 2000, message = "내용은 2000자 이내로 작성해주세요")
        String message
) {
}
