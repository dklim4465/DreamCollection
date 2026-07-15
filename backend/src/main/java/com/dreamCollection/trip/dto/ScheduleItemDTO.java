package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ScheduleItemDTO {

    private String itemKey;
    private String itemType;
    private String timeSlot;
    private String title;
    private String description;
    private String address;
    private Integer durationMinutes;
    private Integer estimatedCost;
    private String imageUrl;
    private Boolean locked;
    // 교체 확인 여부
    private boolean replaceable;
}
