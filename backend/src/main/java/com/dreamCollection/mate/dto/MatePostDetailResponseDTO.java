package com.dreamCollection.mate.dto;

import com.dreamCollection.mate.entity.MatePost;
import lombok.AllArgsConstructor;
import lombok.Getter;


import java.time.LocalDate;
import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class MatePostDetailResponseDTO {

    private final Long id;
    private final Long userId;
    private final Long cityId;
    private final String destination;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String content;
    private final String preferredAge;
    private final String preferredGender;
    private final String travelStyle;
    private final Integer recruitCount;
    private final String status;
    private final LocalDateTime createdAt;

    public static MatePostDetailResponseDTO from(MatePost post) {
        return new MatePostDetailResponseDTO(
                post.getId(), post.getUserId(), post.getCityId(), post.getDestination(), post.getStartDate(),
                post.getEndDate(), post.getContent(), post.getPreferredAge(), post.getPreferredGender(),
                post.getTravelStyle(), post.getRecruitCount(), post.getStatus(), post.getCreatedAt()
        );

    }
}
