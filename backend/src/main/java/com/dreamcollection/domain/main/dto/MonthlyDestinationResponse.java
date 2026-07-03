package com.dreamcollection.domain.main.dto;

import com.dreamcollection.domain.main.entity.MonthlyDestination;

public record MonthlyDestinationResponse(
        Long id,
        String displayMonth,
        String destinationName,
        String title,
        String description,
        String imageUrl,
        String linkUrl,
        Integer displayOrder,
        boolean active
) {
    public static MonthlyDestinationResponse from(MonthlyDestination md) {
        return new MonthlyDestinationResponse(
                md.getId(), md.getDisplayMonth(), md.getDestinationName(), md.getTitle(),
                md.getDescription(), md.getImageUrl(), md.getLinkUrl(), md.getDisplayOrder(), md.isActive()
        );
    }
}
