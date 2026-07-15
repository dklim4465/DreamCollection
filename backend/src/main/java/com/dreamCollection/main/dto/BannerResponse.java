package com.dreamCollection.main.dto;

import com.dreamCollection.main.entity.Banner;

public record BannerResponse(
        Long id,
        String title,
        String mediaType,
        String bannerType,
        String imageUrl,
        String linkUrl,
        Integer displayOrder,
        boolean active
) {
    public static BannerResponse from(Banner banner) {
        return new BannerResponse(
                banner.getId(), banner.getTitle(), banner.getMediaType(), banner.getBannerType(), banner.getImageUrl(),
                banner.getLinkUrl(), banner.getDisplayOrder(), banner.isActive()
        );
    }
}
