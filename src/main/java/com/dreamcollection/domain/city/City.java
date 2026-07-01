package com.dreamcollection.domain.city;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** DB: city 테이블 매핑 (목적지 자동완성 + 날씨/배경 이미지 연동용) */
@Entity
@Table(name = "city")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name_ko", nullable = false, length = 100)
    private String nameKo;

    @Column(name = "name_en", nullable = false, length = 100)
    private String nameEn;

    @Column(name = "country_code", nullable = false, length = 2)
    private String countryCode;

    @Column(name = "country_name", nullable = false, length = 50)
    private String countryName;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(length = 50)
    private String timezone;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_popular", nullable = false)
    private boolean popular = false;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public City(String nameKo, String nameEn, String countryCode, String countryName,
                BigDecimal latitude, BigDecimal longitude, String timezone, String imageUrl, boolean popular) {
        this.nameKo = nameKo;
        this.nameEn = nameEn;
        this.countryCode = countryCode;
        this.countryName = countryName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timezone = timezone;
        this.imageUrl = imageUrl;
        this.popular = popular;
        this.active = true;
    }
}
