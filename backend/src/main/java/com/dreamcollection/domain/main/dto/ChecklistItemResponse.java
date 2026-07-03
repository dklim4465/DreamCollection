package com.dreamcollection.domain.main.dto;

import com.dreamcollection.domain.main.entity.ChecklistItem;

public record ChecklistItemResponse(
        Long id,
        String content,
        String category,
        boolean checked,
        Integer displayOrder
) {
    public static ChecklistItemResponse from(ChecklistItem item) {
        return new ChecklistItemResponse(
                item.getId(), item.getContent(), item.getCategory(),
                item.isChecked(), item.getDisplayOrder()
        );
    }
}
