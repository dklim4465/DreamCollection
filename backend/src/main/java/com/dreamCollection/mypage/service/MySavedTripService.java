package com.dreamCollection.mypage.service;

import com.dreamCollection.mypage.dto.SavedTripSummaryDTO;

import java.util.List;

public interface MySavedTripService {

    // 홈페이지 "내가 저장한 여행" 미리보기 / 내 일정 목록
    List<SavedTripSummaryDTO> getMySavedTrips(Long userId);
}
