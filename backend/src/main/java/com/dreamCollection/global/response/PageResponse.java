package com.dreamCollection.global.response;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * 프론트 types/index.ts 의 PageResponse&lt;T&gt; 와 구조 매칭
 * { content, totalElements, totalPages, page, size }
 */
public record PageResponse<T>(
        List<T> content,
        long totalElements,
        int totalPages,
        int page,
        int size
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.getNumber(),
                page.getSize()
        );
    }
}
