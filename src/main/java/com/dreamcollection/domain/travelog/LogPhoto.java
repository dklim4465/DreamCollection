package com.dreamcollection.domain.travelog;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** DB: log_photo 테이블 매핑 (여행일지 사진, EXIF 위치/시간 추출) */
@Entity
@Table(name = "log_photo")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LogPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "log_id", nullable = false)
    private Long logId;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "taken_at")
    private LocalDateTime takenAt;

    @Builder
    public LogPhoto(Long logId, String imageUrl, BigDecimal latitude, BigDecimal longitude, LocalDateTime takenAt) {
        this.logId = logId;
        this.imageUrl = imageUrl;
        this.latitude = latitude;
        this.longitude = longitude;
        this.takenAt = takenAt;
    }
}
