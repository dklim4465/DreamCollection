package com.dreamCollection.service;

import com.dreamCollection.trip.dto.*;
import com.dreamCollection.trip.service.TripService;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
@Log4j2
public class TripRecommnedTests {

    @Autowired
    private TripService tripService;

    @Test
    void changeToIndex() {
        PlanRequestDTO requestDTO = PlanRequestDTO.builder()
                .who("혼자")
                .when("1박2일")
                .region("일본")
                .theme("휴양")
                .level("힐링여행")
                .build();

        PlanResponseDTO responseDTO = tripService.recommend(requestDTO);

        TripRecommendDTO recommendDTO = responseDTO.getRecommendations().get(0);

        ScheduleItemDTO lunchItem = recommendDTO.getDays().stream()
                .filter(day -> day.getDayNumber().equals(1))
                .flatMap(day -> day.getItems().stream())
                .filter(item -> item.getItemKey().equals("day1-lunch"))
                .findFirst()
                .orElseThrow();

        log.info("기존 선택된 옵션 번호: " + lunchItem.getSelectedOptionIndex());
        log.info("기존의 내용 " +lunchItem.getOptions().get(lunchItem.getSelectedOptionIndex()));

        //0->1번 으로 변경(카드 변경의 느낌)
        lunchItem.setSelectedOptionIndex(1);

        log.info("변경된 옵션 번호: " + lunchItem.getSelectedOptionIndex());
        log.info("변경의 내용 " +lunchItem.getOptions().get(lunchItem.getSelectedOptionIndex()));
    }

    @Test
    void saveToDb() {
        PlanRequestDTO planRequestDTO = PlanRequestDTO.builder()
                .who("연인과")
                .when("2박 3일")
                .region("미국")
                .theme("관광")
                .level("액티비티여행")
                .build();

        PlanResponseDTO planResponseDTO = tripService.recommend(planRequestDTO);

        TripRecommendDTO recommendDTO = planResponseDTO.getRecommendations().get(0);

        recommendDTO.getDays().stream()
                .filter(day -> day.getDayNumber().equals(1))
                .flatMap(day -> day.getItems().stream())
                .filter(item -> "day1-lunch".equals(item.getItemKey()))
                .findFirst()
                .ifPresent(item -> item.setSelectedOptionIndex(1));

        SaveTripRequestDTO saveTripRequestDTO = SaveTripRequestDTO.builder()
                .userId(1L)
                .conditions(planRequestDTO)
                .recommendation(recommendDTO)
                .build();

        SaveTripResponseDTO saveTripResponseDTO = tripService.save(saveTripRequestDTO);

        log.info(saveTripResponseDTO);

    }


    @Test
    void savedTripCheck() {
        PlanRequestDTO planRequestDTO = PlanRequestDTO.builder()
                .who("연인과")
                .when("2박 3일")
                .region("미국")
                .theme("관광")
                .level("액티비티여행")
                .build();

        PlanResponseDTO planResponseDTO = tripService.recommend(planRequestDTO);
        TripRecommendDTO tripRecommendDTO = planResponseDTO.getRecommendations().get(0);

        SaveTripRequestDTO saveTripRequestDTO = SaveTripRequestDTO.builder()
                .userId(1L)
                .conditions(planRequestDTO)
                .recommendation(tripRecommendDTO)
                .build();

        SaveTripResponseDTO saveTripResponseDTO = tripService.save(saveTripRequestDTO);

        SavedTripDTO savedTripDTO = tripService.getSavedTrip(saveTripResponseDTO.getSavedTripId());

        log.info("저장된 일정 : " + savedTripDTO);
    }

    @Test
    void userIdTripCheck() {
        Long userId = 1L;

        List<SavedTripDTO> savedTripDTO = tripService.getSavedTripsByUser(userId);

        log.info("유저별 저장된 일정" + savedTripDTO);
    }


}
