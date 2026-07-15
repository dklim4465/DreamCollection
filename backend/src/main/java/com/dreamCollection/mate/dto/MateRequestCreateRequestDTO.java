package com.dreamCollection.mate.dto;


import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class MateRequestCreateRequestDTO {

    @Size(max = 200, message = "신청 메시지는 200자 이내로 작성해주세요.")
    private String message;
}
