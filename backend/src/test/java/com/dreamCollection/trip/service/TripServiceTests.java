package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.PlanResponseDTO;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

@SpringBootTest
@Slf4j
public class TripServiceTests {

    @Autowired
    private TripService tripService;

    @Test
    void choiceOptions() {
        List<String> whoOptions = tripService.getOptions("who");
        List<String> regionOptions = tripService.getOptions("region");

        assertEquals(List.of("혼자", "친구와", "가족과", "연인과"), whoOptions);
        assertEquals(List.of("일본", "중국", "미국", "아시아"), regionOptions);

        log.info("{}", whoOptions);
        log.info("{}", regionOptions);
    }

    @Test
    void choiceAndResponse() {
        PlanRequestDTO request = PlanRequestDTO.builder()
                .who("혼자")
                .when("1박 2일")
                .region("일본")
                .theme("휴양")
                .level("힐링여행")
                .build();

        PlanResponseDTO response = tripService.recommend(request);

        log.info("----------------------------------------------");
        log.info("response = {}", response);
        log.info("prompt = {}", response.getPrompt());
        log.info("aiResult = {}", response.getAiResult());
        log.info("recommendations = {}", response.getRecommendations());

        assertNotNull(response);
    }
}
