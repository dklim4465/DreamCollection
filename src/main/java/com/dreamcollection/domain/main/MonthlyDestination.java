package com.dreamcollection.domain.main;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/** DB: monthly_destination 테이블 매핑. displayMonth 컬럼은 DB에서 예약어 충돌로 display_month로 이름 변경됨 */
@Entity
@Table(name = "monthly_destination")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MonthlyDestination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "display_month", nullable = false, length = 7)
    private String displayMonth; // 예: "2026-07"

    @Column(name = "destination_name", nullable = false, length = 100)
    private String destinationName;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "source_type", nullable = false, length = 20)
    private String sourceType = "MANUAL";

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public MonthlyDestination(Long adminId, String displayMonth, String destinationName, String title,
                               String description, String imageUrl, String linkUrl, String sourceType) {
        this.adminId = adminId;
        this.displayMonth = displayMonth;
        this.destinationName = destinationName;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.linkUrl = linkUrl;
        this.sourceType = sourceType != null ? sourceType : "MANUAL";
        this.active = true;
    }
}
