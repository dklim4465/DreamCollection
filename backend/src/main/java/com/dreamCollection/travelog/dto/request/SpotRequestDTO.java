package com.dreamCollection.travelog.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpotRequestDTO {

    private String name;

    private String description;

    private Point centerLocation;

    private Instant visitAt;

    private String spotType;

}
