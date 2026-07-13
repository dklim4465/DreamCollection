package com.dreamCollection.travelog.dto.request;

import com.dreamCollection.travelog.dto.GeoJsonPointDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SpotRequestDTO {

    private String name;

    private String description;

    private GeoJsonPointDTO centerLocation;

    private Instant visitAt;

    private String spotType;

}
