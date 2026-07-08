package com.dreamCollection.accommodation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "accommodations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Accommodation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "accommodation_name", nullable = false, length = 150)
    private String accommodationName;

    @Column(name = "accommodation_type", length = 50)
    private String accommodationType;

    @Column(name = "city_name", length = 100)
    private String cityName;

    @Column(name = "country_name", length = 100)
    private String countryName;

    @Column(name = "region", length = 100)
    private String region;

    @Column(length = 255)
    private String address;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(precision = 12, scale = 2)
    private BigDecimal price;

    @Column(length = 10)
    private String currency;

    @Column(precision = 3, scale = 2)
    private BigDecimal rating;

    @Column(length = 50)
    private String provider;

    @Column(name = "provider_accommodation_id", length = 100)
    private String providerAccommodationId;

    @Column(name = "external_url", length = 500)
    private String externalUrl;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Builder
    public Accommodation(
            String accommodationName,
            String accommodationType,
            String cityName,
            String countryName,
            String region,
            String address,
            BigDecimal latitude,
            BigDecimal longitude,
            BigDecimal price,
            String currency,
            BigDecimal rating,
            String provider,
            String providerAccommodationId,
            String externalUrl,
            String imageUrl,
            Integer displayOrder
    ) {
        this.accommodationName = accommodationName;
        this.accommodationType = accommodationType;
        this.cityName = cityName;
        this.countryName = countryName;
        this.region = region;
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.price = price;
        this.currency = currency;
        this.rating = rating;
        this.provider = provider;
        this.providerAccommodationId = providerAccommodationId;
        this.externalUrl = externalUrl;
        this.imageUrl = imageUrl;
        this.displayOrder = displayOrder;
    }
}