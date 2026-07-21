package com.dreamCollection.travelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripLogStatisticsDTO {

    private Long tno;

    private int spotCount;

    private int mediaCount;

    private Long totalAmount;

    private List<String> countries;

    private Long totalDistance;

}
