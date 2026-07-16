// src/main/java/com/dreamCollection/board/dto/BoardPostListResponseDTO.java
package com.dreamCollection.board.dto;

import com.dreamCollection.board.entity.BoardPost;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BoardPostListResponseDTO {

    private final Long id;
    private final String category;
    private final String title;
    private final BigDecimal price;
    private final Integer viewCount;
    private final Integer likeCount;
    private final String tradeStatus;
    private final LocalDateTime createdAt;
    private final Long userId;
    private final String nickname;
    private final String profileImageUrl;
    private final long commentCount;
    private final int level;
    private final String badgeName;
    private final String badgeIconUrl;
    private final String badgeConditionType;

    public static BoardPostListResponseDTO from(BoardPost post, String nickname, String profileImageUrl, long commentCount, AuthorLevelBadgeInfo levelBadgeInfo) {
        return new BoardPostListResponseDTO(
                post.getId(),
                post.getCategory(),
                post.getTitle(),
                post.getPrice(),
                post.getViewCount(),
                post.getLikeCount(),
                post.getTradeStatus(),
                post.getCreatedAt(),
                post.getUserId(),
                nickname,
                profileImageUrl,
                commentCount,
                levelBadgeInfo.level(),
                levelBadgeInfo.badgeName(),
                levelBadgeInfo.badgeIconUrl(),
                levelBadgeInfo.badgeConditionType()
        );
    }
}