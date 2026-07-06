package com.dreamCollection.mate.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class MateReviewCreateRequestDTO {

    @NotNull(message = "동행 게시글을 선택해주세요.")
    private Long matePostId;

    @NotNull(message = "후기 작성 대상을 선택해주세요." )
    private Long revieweeId;

    @NotNull(message = "평점은 필수입니다.")
    @Min(value = 1, message = "평점은 1점 이상이어야 합니다.")
    @Max(value = 5, message = "평점은 5점 이하여야 합니다.")
    private Integer rating;

    @Size(max = 500,message = "후기는 500자 이내로 입력해주세요.")
    private String content;
}
