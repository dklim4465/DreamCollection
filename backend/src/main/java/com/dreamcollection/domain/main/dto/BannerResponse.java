package com.dreamcollection.domain.main.dto;

import com.dreamcollection.domain.main.entity.Banner;

public record BannerResponse(
        Long id,
        String title,
        String imageUrl,
        String linkUrl,
        Integer displayOrder,
        boolean active
) {
    public static BannerResponse from(Banner banner) {
        return new BannerResponse(
                banner.getId(), banner.getTitle(), banner.getImageUrl(),
                banner.getLinkUrl(), banner.getDisplayOrder(), banner.isActive()
        );
    }
}
