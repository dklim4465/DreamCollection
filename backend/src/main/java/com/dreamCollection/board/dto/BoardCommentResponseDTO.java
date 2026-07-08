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

    public static BoardCommentResponseDTO from(com.dreamCollection.board.entity.BoardComment comment) {
        return new BoardCommentResponseDTO(
                comment.getId(),
                comment.getPostId(),
                comment.getUserId(),
                comment.getParentCommentId(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }
}