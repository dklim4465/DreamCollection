package com.dreamcollection.domain.trip.service;

import com.dreamcollection.domain.trip.ai.TripAiClient;
import com.dreamcollection.domain.trip.dto.*;
import com.dreamcollection.domain.trip.entity.SavedTrip;
import com.dreamcollection.domain.trip.exception.TripSaveException;
import com.dreamcollection.domain.trip.recommend.TripRecommendationBuilder;
import com.dreamcollection.domain.trip.repository.SavedTripRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TripServiceImpl implements TripService {

    private final TripAiClient tripAiClient;
    private final TripRecommendationBuilder tripRecommendationBuilder;
    private final SavedTripRepository savedTripRepository;
    private final ObjectMapper objectMapper;


    @Override
    public List<String> getOptions(String type) {
        List<String> options = OPTION_MAP.get(type);

        if (options == null) {
            throw new IllegalArgumentException("잘못된 옵션 타입입니다.");
        }

        return options;
    }

    // 이걸로 응답 값 받아와서 그 출력 값 내보내기 까지
    @Override
    public PlanResponseDTO recommend(PlanRequestDTO request) {
        String prompt = buildPrompt(request);
        String aiResult = tripAiClient.recommend(prompt);

        return buildResponse(request, prompt, aiResult);
    }

    // 프롬프트 넣을 곳
    @Override
    public String buildPrompt(PlanRequestDTO request) {
        // 아래 프롬프트는 수정해 넣어야함********** 더 올바르게 바꿔야하는거 잊지 말지 아래는 틀 정도
        return """
                아래 여행 조건에 맞는 여행 일정을 추천해줘.

                동행 유형: %s
                여행 기간: %s
                여행 지역: %s
                여행 테마: %s
                여행 강도: %s

                조건에 맞는 추천 일정을 날짜별로 구성할 수 있도록 준비해줘.
                """.formatted(
                request.getWho(),
                request.getWhen(),
                request.getRegion(),
                request.getTheme(),
                request.getLevel()
        );
    }

    @Override
    public SaveTripResponseDTO save(SaveTripRequestDTO requestDTO){
        validateSaveRequest(requestDTO);

        SavedTrip savedTrip = SavedTrip.builder()
                .userId(requestDTO.getUserId())
                .conditionsJson(toJson(requestDTO.getConditions()))
                .recommendationJson(toJson(requestDTO.getRecommendation()))
                .build();

        SavedTrip result = savedTripRepository.save(savedTrip);

        return SaveTripResponseDTO.builder()
                .savedTripId(result.getId())
                .message("일정이 저장되었습니다.")
                .build();
    }

//    @Override
//    public ReplaceScheduleResponseDTO replaceScheduleItem(ReplaceScheduleRequestDTO replaceScheduleRequestDTO){
//        return tripScheduleItemReplacer.replace(replaceScheduleRequestDTO);
//    }

    // 이걸로 받아온 값을 싹싹 긁어 모아서 출력하는 메서드
    private PlanResponseDTO buildResponse(
            PlanRequestDTO request,
            String prompt,
            String aiResult
    ) {
        return PlanResponseDTO.builder()
                .who(request.getWho())
                .when(request.getWhen())
                .region(request.getRegion())
                .theme(request.getTheme())
                .level(request.getLevel())
                .prompt(prompt)
                .aiResult(aiResult)
                .recommendations(tripRecommendationBuilder.build(request, aiResult)
                )
                .build();
    }

    private void validateSaveRequest(SaveTripRequestDTO saveTripRequestDTO){
        if (saveTripRequestDTO == null){
            throw new TripSaveException("저장 요청 정보가 없습니다.");
        }
        if (saveTripRequestDTO.getUserId() == null){
            throw new TripSaveException("사용자 정보가 없습니다.");
        }
        if (saveTripRequestDTO.getRecommendation() == null){
            throw new TripSaveException("저장할 추천 일정이 없습니다.");
        }
    }

    private String toJson(Object value){
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e){
            throw new TripSaveException("일정 저장 JSON 변환에 실패했습니다", e);
        }
    }


    // 선택지가 더 필요하면 아래 값 추가하기-------------------------------------------------------------------
    private static final List<String> WHO_OPTIONS =
            List.of("혼자", "친구와", "가족과", "연인과");

    private static final List<String> WHEN_OPTIONS =
            List.of("1박 2일", "2박 3일", "3박 4일", "4박 5일");

    private static final List<String> REGION_OPTIONS =
            List.of("일본", "중국", "미국", "아시아");

    private static final List<String> THEME_OPTIONS =
            List.of("액티비티", "휴양", "기타");

    private static final List<String> LEVEL_OPTIONS =
            List.of("힐링여행", "빡센여행");
    // 여기까지가 선택지 수정내용-----------------------

    private static final Map<String, List<String>> OPTION_MAP = Map.of(
            "who", WHO_OPTIONS,
            "when", WHEN_OPTIONS,
            "region", REGION_OPTIONS,
            "theme", THEME_OPTIONS,
            "level", LEVEL_OPTIONS
    );

    @Override
    public List<String> getWho() {
        return WHO_OPTIONS;
    }
    @Override
    public List<String> getWhen() {
        return WHEN_OPTIONS;
    }
    @Override
    public List<String> getRegion() {
        return REGION_OPTIONS;
    }
    @Override
    public List<String> getTheme() {
        return THEME_OPTIONS;
    }
    @Override
    public List<String> getLevel() {
        return LEVEL_OPTIONS;
    }

}
