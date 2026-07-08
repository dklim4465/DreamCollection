package com.dreamCollection.mate.dto;


import com.dreamCollection.mate.entity.MatePost;
import lombok.AllArgsConstructor;
import lombok.Getter;


import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MatePostListResponseDTO {

    private final Long id;
    private final String destination;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String preferredAge;
    private final String preferredGender;
    private final String travelStyle;
    private final Integer recruitCount;
    private final String status;
    private final LocalDateTime createdAt;

    public static MatePostListResponseDTO from(MatePost post) {
        return new MatePostListResponseDTO(
                post.getId(), post.getDestination(), post.getStartDate(), post.getEndDate(),
                post.getPreferredAge(), post.getPreferredGender(), post.getTravelStyle(),
                post.getRecruitCount(), post.getStatus(), post.getCreatedAt()
        );
    }

}