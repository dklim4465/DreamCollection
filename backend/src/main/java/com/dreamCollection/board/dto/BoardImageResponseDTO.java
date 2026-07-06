package com.dreamCollection.board.dto;


import com.dreamCollection.board.entity.BoardImage;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BoardImageResponseDTO {

    private final Long id;
    private final Long postId;
    private final String imageUrl;
    private final Integer orderNo;

    public static BoardImageResponseDTO from(BoardImage image){
        return new BoardImageResponseDTO(
                image.getId(), image.getPostId(), image.getImageUrl(), image.getOrderNo()
        );
    }
}
