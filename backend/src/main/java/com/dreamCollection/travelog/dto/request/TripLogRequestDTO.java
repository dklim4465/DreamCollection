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

}