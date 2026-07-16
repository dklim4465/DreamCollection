package com.dreamCollection.board.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class BoardCommentResponseDTO {

    private final Long id;
    private final Long postId;
    private final Long userId;
    private final Long parentCommentId;
    private final String content;
    private final LocalDateTime createdAt;
    private final String nickname;
    private final String profileImageUrl;

    public static BoardCommentResponseDTO from(
            com.dreamCollection.board.entity.BoardComment comment,
            String nickname,
            String profileImageUrl
    ) {
        return new BoardCommentResponseDTO(
                comment.getId(),
                comment.getPostId(),
                comment.getUserId(),
                comment.getParentCommentId(),
                comment.getContent(),
                comment.getCreatedAt(),
                nickname,
                profileImageUrl
        );
    }
}