package com.dreamCollection.trip;

import com.dreamCollection.trip.dto.PlanRequestDTO;
import com.dreamCollection.trip.dto.PlanResponseDTO;
import com.dreamCollection.trip.option.TripOptionProvider;
import com.dreamCollection.trip.service.TripService;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

@SpringBootTest
@Log4j2
public class TripServiceTests {

    @Autowired
    private TripService tripService;

    @Autowired
    private TripOptionProvider tripOptionProvider;

    @Test
    void choiceOptions() {
        List<String> whoOptions = tripOptionProvider.getOptions("who");
        List<String> regionOptions = tripOptionProvider.getOptions("region");

        assertEquals(List.of("혼자", "연인과", "친구와", "가족과"), whoOptions);
        assertEquals(List.of("일본", "중국", "미국", "아시아"), regionOptions);

        log.info(whoOptions);
        log.info(regionOptions);
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
