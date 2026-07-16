package com.dreamCollection.board.dto;

import com.dreamCollection.board.entity.BoardPost;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BoardPostDetailResponseDTO {

    private final Long id;
    private final Long userId;
    private final String category;
    private final String title;
    private final String content;
    private final BigDecimal price;
    private final Integer viewCount;
    private final Integer likeCount;
    private final String tradeStatus;
    private final LocalDateTime createdAt;
    private final String nickname;
    private final String profileImageUrl;
    private final boolean liked;

    public static BoardPostDetailResponseDTO from(BoardPost post, String nickname, String profileImageUrl, boolean liked) {
        return new BoardPostDetailResponseDTO(
                post.getId(),
                post.getUserId(),
                post.getCategory(),
                post.getTitle(),
                post.getContent(),
                post.getPrice(),
                post.getViewCount(),
                post.getLikeCount(),
                post.getTradeStatus(),
                post.getCreatedAt(),
                nickname,
                profileImageUrl,
                liked
        );
    }
}