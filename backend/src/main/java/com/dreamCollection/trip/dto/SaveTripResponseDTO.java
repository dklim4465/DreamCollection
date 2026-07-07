package com.dreamCollection.trip.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
// 저장 성공 응답용
public class SaveTripResponseDTO {

    private Long savedTripId;

    private String message;

}
