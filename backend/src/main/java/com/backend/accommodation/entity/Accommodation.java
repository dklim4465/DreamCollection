package com.backend.accommodation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** DB: accommodations 테이블 매핑 (숙소 정보) */
@Entity
@Table(name = "accommodations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Accommodation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 30)
    private String city;

    @Column(length = 150)
    private String address;

    @Column(name = "accommodation_type", length = 20)
    private String accommodationType;

    @Column(name = "price_per_night")
    private Integer pricePerNight;

    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Column(name = "image_url", length = 255)
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 255)
    private String amenities;

    @Builder
    public Accommodation(String name, String city, String address, String accommodationType,
                          Integer pricePerNight, BigDecimal rating, String imageUrl,
                          String description, String amenities) {
        this.name = name;
        this.city = city;
        this.address = address;
        this.accommodationType = accommodationType;
        this.pricePerNight = pricePerNight;
        this.rating = rating;
        this.imageUrl = imageUrl;
        this.description = description;
        this.amenities = amenities;
    }
}
