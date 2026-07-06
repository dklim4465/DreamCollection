package com.dreamcollection.domain.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlanRequestDTO {

    private String who;
    private String when;
    private String region;
    private String theme;
    private String level;
}
