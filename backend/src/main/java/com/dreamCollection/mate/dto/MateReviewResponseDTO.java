package com.dreamCollection.mate.dto;


import com.dreamCollection.mate.entity.MateReview;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MateReviewResponseDTO {

    private final Long id;
    private final Long matePostId;
    private final Long reviewerId;
    private final Long revieweeId;
    private final Integer rating;
    private final String content;
    private final LocalDateTime createdAt;

    public static MateReviewResponseDTO from(MateReview review){
        return new MateReviewResponseDTO(review.getId(), review.getMatePostId(), review.getReviewerId(),
                review.getRevieweeId(), review.getRating(), review.getContent(), review.getCreatedAt());
    }
}
