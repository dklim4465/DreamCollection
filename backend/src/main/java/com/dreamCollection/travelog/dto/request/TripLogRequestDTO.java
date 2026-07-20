package com.dreamCollection.travelog.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripLogRequestDTO {

    private String title;

    private LocalDate startDate;

    private LocalDate endDate;

    private String description;

    private Long thumbnailMediaMno;

    // 어느 나라 여행이었는지 (선택). 있으면 나의기록 저장 시 국가 뱃지가 자동으로 지급된다.
    private String countryCode;

}
