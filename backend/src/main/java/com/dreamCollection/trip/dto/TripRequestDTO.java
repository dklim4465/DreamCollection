package com.dreamCollection.trip.dto;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TripRequestDTO {
    @Id
    private Long id; // 요청 고유 식별용 아이디
    private Long userId; // 받아온 아이디 (유저 아이디)
    private String companionType; // 동행자 타입
    private LocalDate startDate; // 시작일
    private LocalDate endDate; // 종료일
    private String destination; //여행 지역, 도시 등
    private String theme; // 여행의 테마
    private String densityLevel; // 일정 밀집도
    private String status; // 요청 처리 상태
    private LocalDateTime createDate; // 요청 생성일시
}
