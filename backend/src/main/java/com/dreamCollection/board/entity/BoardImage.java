package com.dreamCollection.board.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "board_image")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BoardImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "post_id", nullable = false)
    private Long postId;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "order_no", nullable = false)
    private Integer orderNo = 0;

    @Builder
    public BoardImage(Long postId, String imageUrl, Integer orderNo) {
        this.postId = postId;
        this.imageUrl = imageUrl;
        this.orderNo = orderNo != null ? orderNo : 0;
    }
}
