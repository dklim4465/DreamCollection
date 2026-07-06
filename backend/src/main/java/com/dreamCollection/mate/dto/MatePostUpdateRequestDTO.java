package com.dreamCollection.mate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
public class MatePostUpdateRequestDTO {

    @NotBlank(message = "여행지는 필수입니다.")
    private String destination;

    private LocalDate startDate;
    private LocalDate endDate;

    @NotBlank(message = "내용은 필수입니다.")
    private String content;

    private String preferredAge;
    private String preferredGender;
    private String travelStyle;
    private Integer recruitCount;
    private String status;
}
