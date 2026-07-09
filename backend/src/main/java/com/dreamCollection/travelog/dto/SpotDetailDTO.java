package com.dreamCollection.travelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpotDetailDTO {

    private Long sno;

    private String name;

    private String description;

    private GeoJsonPointDTO centerLocation;

    private Instant visitAt;

    private Instant leaveAt;

    private String coverImagePath;

    private List<MediaSummaryDTO> mediaList;
}
