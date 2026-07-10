package com.dreamCollection.board.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BoardImageCreateRequestDTO {

    @NotBlank (message = "이미지 URL은 필수입니다.")
    private String imageUrl;

    private Integer orderNo;
}