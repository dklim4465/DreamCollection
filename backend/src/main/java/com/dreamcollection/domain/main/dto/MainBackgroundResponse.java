package com.dreamcollection.domain.main.dto;

import com.dreamcollection.domain.main.entity.MainBackground;

public record MainBackgroundResponse(
        Long id,
        String mediaType,
        String mediaUrl,
        boolean active
) {
    public static MainBackgroundResponse from(MainBackground bg) {
        return new MainBackgroundResponse(bg.getId(), bg.getMediaType(), bg.getMediaUrl(), bg.isActive());
    }
}
