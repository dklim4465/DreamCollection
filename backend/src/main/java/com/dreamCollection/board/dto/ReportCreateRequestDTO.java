package com.dreamCollection.board.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ReportCreateRequestDTO {

    @NotBlank(message = "신고 대상 유형은 필수입니다.")
    private String targetType;

    @NotNull(message = "신고 대상 ID는 필수입니다.")
    private Long targetId;

    @NotBlank(message = "신고 사유는 필수입니다.")
    @Size(max = 255, message = "신고 사유는 255자 이내로 입력해주세요.")
    private String reason;
}
