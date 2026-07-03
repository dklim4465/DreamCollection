package com.dreamcollection.domain.admin.dto;

import jakarta.validation.constraints.NotBlank;

public record ChangeUserStatusRequest(
        @NotBlank(message = "상태값을 입력해주세요") String status // ACTIVE | SUSPENDED | WITHDRAWN
) {
}
