package com.dreamCollection.travelog.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

@Data
@AllArgsConstructor
public class MetadataInfoDTO {

    private Instant takenAt;

    private Point location;
}
