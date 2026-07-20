package com.dreamCollection.user.service;

import com.dreamCollection.user.level.LevelPolicy;
import com.dreamCollection.user.dto.LevelResponse;
import com.dreamCollection.trip.repository.SavedTripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LevelService {

    private final SavedTripRepository savedTripRepository;

    /**
     * 마이페이지 "레벨 시스템" — 여행 횟수 기준으로 레벨 계산.
     * 카운트 소스는 현재 saved_trips(여행 저장) 기준. LevelPolicy 클래스 주석 참고.
     * (뱃지 시스템은 제거되어 레벨 계산만 담당함)
     */
    public LevelResponse getMyLevel(Long userId) {
        long tripCount = savedTripRepository.countByUserId(userId);
        int level = LevelPolicy.levelFor(tripCount);
        Integer nextThreshold = LevelPolicy.nextThreshold(tripCount);

        return LevelResponse.of(level, tripCount, nextThreshold);
    }
}
