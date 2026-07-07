package com.dreamCollection.mate.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MateScheduleLinkCreateRequestDTO {
    @NotNull(message = "신청 ID는 필수입니다.")
    private Long requestId;

}
