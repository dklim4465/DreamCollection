package com.dreamCollection.travelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Duration;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripLogStatsDTO {

    private int spotCount;

    private int mediaCount;

    private double totalDistance;

    private Duration travelTime;

    private List<String> countries;
}
