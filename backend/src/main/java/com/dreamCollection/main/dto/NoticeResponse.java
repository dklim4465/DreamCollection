package com.dreamCollection.main.dto;

import com.dreamCollection.main.entity.Notice;

import java.time.LocalDateTime;

public record NoticeResponse(
        Long id,
        String title,
        String content,
        String couponCode,
        boolean pinned,
        boolean active,
        Integer viewCount,
        LocalDateTime createdAt
) {
    public static NoticeResponse from(Notice notice) {
        return new NoticeResponse(
                notice.getId(), notice.getTitle(), notice.getContent(), notice.getCouponCode(),
                notice.isPinned(), notice.isActive(), notice.getViewCount(), notice.getCreatedAt()
        );
    }
}
