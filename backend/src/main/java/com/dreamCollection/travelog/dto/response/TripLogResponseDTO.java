package com.dreamCollection.travelog.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TripLogResponseDTO {

    private Long tno;

    private String title;

    private LocalDate startDate;

    private LocalDate endDate;

    private String thumbnailPath;

    private String description;

    private String countryCode;

    private Instant createdAt;

    private Instant modifiedAt;

    private List<String> tags;

}