package com.dreamcollection.domain.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PlaceOptionDTO {

    private Integer option;
    private String placeName;
    private String category;
    private String description;
}
