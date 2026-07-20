package com.dreamCollection.travelog.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripLogOverviewDTO {

    private Long tno;

    private String title;

    private LocalDate startDate;

    private LocalDate endDate;

    private List<SpotDetailDTO> spots;

    private String thumbnailPath;

}
