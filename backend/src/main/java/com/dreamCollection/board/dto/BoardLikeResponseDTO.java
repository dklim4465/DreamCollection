package com.dreamCollection.board.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class BoardLikeResponseDTO {

    private final boolean liked;
    private final int likeCount;
}