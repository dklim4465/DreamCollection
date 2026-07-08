package com.dreamCollection.mate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class MateRequestDecisionRequestDTO {
    @NotBlank(message = "승인 여부는 필수입니다.")
    @Pattern(regexp = "ACCEPT|REJECT")
    private String decision;



}
