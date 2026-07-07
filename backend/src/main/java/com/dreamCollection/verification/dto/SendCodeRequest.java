package com.dreamCollection.verification.dto;

import jakarta.validation.constraints.NotBlank;

public record SendCodeRequest(
        @NotBlank(message = "전화번호를 입력해주세요")
        String phone
) {
}
