package com.dreamCollection.main.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: checklist_item 테이블 매핑 (여행 요청별 준비 체크리스트) */
@Entity
@Table(name = "checklist_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @Column(nullable = false, length = 150)
    private String content;

    @Column(length = 30)
    private String category;

    @Column(name = "is_checked", nullable = false)
    private boolean checked = false;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "checked_at")
    private LocalDateTime checkedAt;

    @Builder
    public ChecklistItem(Long requestId, String content, String category, Integer displayOrder) {
        this.requestId = requestId;
        this.content = content;
        this.category = category;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
    }

    public void toggle() {
        this.checked = !this.checked;
        this.checkedAt = this.checked ? LocalDateTime.now() : null;
    }
}
