package com.backend.main;

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
@Table(name = "main_background")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MainBackground {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "media_type", nullable = false, length = 10)
    private String mediaType = "IMAGE";

    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl;

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
    public MainBackground(Long adminId, String mediaType, String mediaUrl) {
        this.adminId = adminId;
        this.mediaType = mediaType != null ? mediaType : "IMAGE";
        this.mediaUrl = mediaUrl;
        this.active = true;
    }
}
