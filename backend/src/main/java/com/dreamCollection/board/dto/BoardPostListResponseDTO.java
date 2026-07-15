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

    public static BoardPostListResponseDTO from(BoardPost post, String nickname) {
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
                nickname
        );
    }
}