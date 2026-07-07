package com.dreamCollection.mate.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class MatePostCreateRequestDTO {

    private Long cityId;

    @NotBlank(message = "여행지는 필수입니다.")
    private String destination;

    @NotNull(message = "시작일은 필수입니다.")
    @Future(message = "시작일은 오늘 이후여야 합니다.")
    private LocalDate startDate;

    @NotNull(message = "종료일은 필수입니다.")
    private LocalDate endDate;

    @NotBlank(message = "내용은 필수입니다.")
    private String content;

    private String preferredAge;
    private String preferredGender;
    private String travelStyle;

    @Min(value = 1, message = "모집인원은 1명 이상이어야 합니다.")
    private Integer recruitCount;
}

