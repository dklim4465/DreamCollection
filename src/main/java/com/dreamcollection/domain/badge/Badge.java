package com.dreamcollection.domain.badge;

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

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public Badge(String code, String name, String description, String iconUrl, String conditionType, Integer conditionValue) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.conditionType = conditionType;
        this.conditionValue = conditionValue;
        this.active = true;
    }
}
