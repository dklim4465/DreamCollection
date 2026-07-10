package com.dreamCollection.main.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "banner")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "media_type", nullable = false, length = 10)
    private String mediaType = "IMAGE";

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @Column(name = "start_at")
    private LocalDateTime startAt;

    @Column(name = "end_at")
    private LocalDateTime endAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Builder
    public Banner(Long adminId, String title, String mediaType, String imageUrl, String linkUrl, Integer displayOrder) {
        this.adminId = adminId;
        this.title = title;
        this.mediaType = mediaType != null ? mediaType : "IMAGE";
        this.imageUrl = imageUrl;
        this.linkUrl = linkUrl;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.active = true;
    }
}
