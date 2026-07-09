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
public class MediaDetailDTO {

    private Long mno;

    private String mediaPath;

    private String storedFileName;

    private Instant takenAt;

    private GeoJsonPointDTO location;

    private String mediaText;
}
