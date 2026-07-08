package com.dreamCollection.badge.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "badge")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "icon_url", nullable = false, length = 500)
    private String iconUrl;

    @Column(name = "condition_type", nullable = false, length = 30)
    private String conditionType;

    @Column(name = "condition_value")
    private Integer conditionValue;

    // condition_type=COUNTRY_VISIT일 때만 값 있음 (도감의 국가 코드, city.country_code와 매칭)
    @Column(name = "condition_country_code", length = 2)
    private String conditionCountryCode;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Badge(String code, String name, String description, String iconUrl, String conditionType, Integer conditionValue, String conditionCountryCode) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.conditionType = conditionType;
        this.conditionValue = conditionValue;
        this.conditionCountryCode = conditionCountryCode;
        this.active = true;
    }
}
