package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecommendationBlockDTO {

    private String blockId;
    private String category; // SCHEDULE, FOOD, EXPERIENCE
    private String title;
    private String description;
    private String address;
    private Integer durationMinutes;
    private Integer estimatedCost;
    private String imageUrl;
}
