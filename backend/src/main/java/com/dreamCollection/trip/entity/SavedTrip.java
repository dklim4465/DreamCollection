package com.dreamCollection.trip.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_trips")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SavedTrip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "conditions_json", columnDefinition = "TEXT")
    private String conditionsJson;

    @Column(name = "recommendation_json", columnDefinition = "LONGTEXT", nullable = false)
    private String recommendationJson;

    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "flight_selection_json", columnDefinition = "TEXT")
    private String flightSelectionJson;

    @Column(name = "accommodation_selection_json", columnDefinition = "TEXT")
    private String accommodationSelectionJson;

    @PrePersist
    void prePersist() {
        this.createdDate = LocalDateTime.now();
    }

    @Builder
    public SavedTrip(Long userId, String conditionsJson, String recommendationJson, String flightSelectionJson, String accommodationSelectionJson) {
        this.userId = userId;
        this.conditionsJson = conditionsJson;
        this.recommendationJson = recommendationJson;
        this.flightSelectionJson = flightSelectionJson;
        this.accommodationSelectionJson = accommodationSelectionJson;
    }
    public void changeRecommendation(String recommendationJson) {
        this.recommendationJson = recommendationJson;
    }
}