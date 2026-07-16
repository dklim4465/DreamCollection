// src/main/java/com/dreamCollection/mate/dto/MatePostListResponseDTO.java
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
    private final Long userId;
    private final String nickname;
    private final String profileImageUrl;
    private final int level;
    private final String badgeName;
    private final String badgeIconUrl;
    private final String badgeConditionType;

    public static MatePostListResponseDTO from(MatePost post, String nickname, String profileImageUrl, AuthorLevelBadgeInfo levelBadgeInfo) {
        return new MatePostListResponseDTO(
                post.getId(), post.getDestination(), post.getStartDate(), post.getEndDate(),
                post.getPreferredAge(), post.getPreferredGender(), post.getTravelStyle(),
                post.getRecruitCount(), post.getStatus(), post.getCreatedAt(),
                post.getUserId(), nickname, profileImageUrl,
                levelBadgeInfo.level(), levelBadgeInfo.badgeName(), levelBadgeInfo.badgeIconUrl(),
                levelBadgeInfo.badgeConditionType()
        );
    }

}