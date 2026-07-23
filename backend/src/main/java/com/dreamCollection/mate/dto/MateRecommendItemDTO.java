package com.dreamCollection.mate.dto;

import com.dreamCollection.mate.entity.MatePost;

public record MateRecommendItemDTO(
        Long postId,
        String destination,
        String travelStyle,
        String content,
        String reason
) {
    public static MateRecommendItemDTO from(MatePost post, String reason) {
        return new MateRecommendItemDTO(
                post.getId(),
                post.getDestination(),
                post.getTravelStyle(),
                post.getContent(),
                reason
        );
    }
}