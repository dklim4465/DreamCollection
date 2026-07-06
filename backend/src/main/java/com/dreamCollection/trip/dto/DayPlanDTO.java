package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DayPlanDTO {

    private Integer dayNumber;
    private String dayTitle;

    private List<ScheduleItemDTO> items;
}
