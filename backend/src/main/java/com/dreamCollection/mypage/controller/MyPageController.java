package com.dreamCollection.mypage.controller;

import com.dreamCollection.mypage.dto.SavedTripSummaryDTO;
import com.dreamCollection.mypage.service.MySavedTripService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 마이페이지 관련 API.
 * trip 팀이 작업 중인 TripRequestController와는 별도 파일로 분리해서,
 * 같은 파일 수정으로 인한 충돌을 피한다.
 * 프론트가 이미 /api/trip/saved 를 호출하고 있어서 URL은 그대로 유지한다.
 */
@RestController
@Log4j2
@RequiredArgsConstructor
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000"
})
@RequestMapping("/api/trip")
public class MyPageController {

    private final MySavedTripService mySavedTripService;

    // 홈페이지 "내가 저장한 여행" 미리보기 / 내 일정 목록 → GET /api/trip/saved (로그인 필요)
    @GetMapping("/saved")
    public List<SavedTripSummaryDTO> getMySavedTrips(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        return mySavedTripService.getMySavedTrips(userId);
    }
}
