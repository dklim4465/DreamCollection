package com.dreamCollection.trip.service;

import com.dreamCollection.trip.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Slf4j
public class TripRecommnedTests {

    @Autowired
    private TripService tripService;

//    @Test
//    void daysCountRecommend() {
//
//        log.info("-------------------------------------------------");
//
//        PlanRequestDTO request = PlanRequestDTO.builder()
//                .who("혼자")
//                .when("2박 3일")
//                .region("일본")
//                .theme("휴양")
//                .level("힐링여행")
//                .build();
//
//        PlanResponseDTO response = tripService.recommend(request);
//
//        assertNotNull(response);
//        assertNotNull(response.getRecommendations());
//
//        for (TripRecommendDTO tripRecommendDTO : response.getRecommendations()) {
//            log.info(tripRecommendDTO.getRecommendation());
//            log.info(tripRecommendDTO.getTitle());
//            log.info(tripRecommendDTO.getSummary());
//
//            tripRecommendDTO.getDays().forEach(day->{
//                log.info("",day.getDayNumber(),
//                        day.getDayTitle()
//                );
//
//                day.getItems().forEach(item -> {
//                    log.info(item.getItemKey(),
//                            item.getItemType(),
//                            item.getTimeSlot(),
//                            item.getTitle(),
//                            item.getSelectOption(),
//                            item.getAlterOption());
//                });
//            });
//        }
//    }

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

        log.info("{}", saveTripResponseDTO);

    }



}
