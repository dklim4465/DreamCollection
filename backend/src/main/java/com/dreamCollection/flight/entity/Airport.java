package com.dreamCollection.flight.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "airports")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Airport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "airport_code", nullable = false, length = 10)
    private String airportCode;

    @Column(name = "airport_name", nullable = false, length = 100)
    private String airportName;

    @Column(name = "city_name", length = 100)
    private String cityName;

    @Column(name = "country_name", length = 100)
    private String countryName;

    @Column(name = "region", length = 100)
    private String region;

    @Column(precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Builder
    public Airport(
            String airportCode,
            String airportName,
            String cityName,
            String countryName,
            String region,
            BigDecimal latitude,
            BigDecimal longitude,
            Integer displayOrder
    ) {
        this.airportCode = airportCode;
        this.airportName = airportName;
        this.cityName = cityName;
        this.countryName = countryName;
        this.region = region;
        this.latitude = latitude;
        this.longitude = longitude;
        this.displayOrder = displayOrder;
    }
}