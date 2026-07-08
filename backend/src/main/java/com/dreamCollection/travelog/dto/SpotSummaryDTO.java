package com.dreamCollection.travelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpotSummaryDTO {

    private Long sno;

    private String name;

    private String description;

    private double latitude;

    private double longitude;

    private Instant visitAt;

    private Instant leaveAt;

    private String coverImagePath;

    private int mediaCount;
}
