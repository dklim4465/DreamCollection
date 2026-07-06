package com.dreamcollection.domain.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ScheduleItemDTO {

    private String itemKey;

    private String itemType;

    private String timeSlot;

    private String title;

    // 현재 선택된 옵션
    private List<PlaceOptionDTO> options;

    // 선택된 태그(일정, 장소 등)의 번호
    private Integer selectedOptionIndex;

    // 교체 확인 여부
    private boolean replaceable;
}
