package com.dreamCollection.chatbot.service;

import com.dreamCollection.badge.repository.BadgeRepository;
import com.dreamCollection.city.repository.CityRepository;
import com.dreamCollection.main.dto.MonthlyDestinationResponse;
import com.dreamCollection.main.service.MonthlyDestinationService;
import com.dreamCollection.stats.dto.StatsResponse;
import com.dreamCollection.stats.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI 챗봇이 "이 사이트"에 대한 질문(인기 여행지, 회원 수, 몇 개국 등)에
 * 실제 DB 값 기준으로 답할 수 있도록, 매 요청마다 최신 데이터를 짧게 요약해서
 * GeminiChatClient의 시스템 프롬프트 뒤에 붙여준다.
 *
 * 매번 새로 조회하기 때문에 관리자가 데이터를 바꾸면(이달의 여행지 갱신 등)
 * 별도 캐시 무효화 없이 챗봇도 바로 최신 정보로 답한다.
 */
@Service
@RequiredArgsConstructor
public class SiteContextService {

    private final CityRepository cityRepository;
    private final MonthlyDestinationService monthlyDestinationService;
    private final StatsService statsService;
    private final BadgeRepository badgeRepository;

    @Transactional(readOnly = true)
    public String build() {
        StatsResponse stats = statsService.getStats();

        String popularCities = cityRepository.findByPopularTrueAndActiveTrueOrderById().stream()
                .map(c -> c.getNameKo() + "(" + c.getCountryName() + ")")
                .collect(Collectors.joining(", "));

        List<MonthlyDestinationResponse> monthly = monthlyDestinationService.getCurrentMonthDestinations();
        String monthlyTop = monthly.stream()
                .limit(5)
                .map(MonthlyDestinationResponse::destinationName)
                .collect(Collectors.joining(", "));

        long countryBadgeCount = badgeRepository.countByConditionType("COUNTRY_VISIT");

        return """
                [Dream Collection 사이트 현황 — %s 기준]
                - 서비스 기능: 여행 일정 만들기, 나의기록(사진/영상으로 남기는 여행일지), 메이트 찾기,
                  실시간 채팅, 중고/자유 게시판, 공지사항(웰컴 쿠폰 지급), 뱃지 도감(마이페이지)
                - 누적 현황: 등록된 여행 일정 %d개, 함께한 여행자 %d명, 작성된 여행일지 %d개
                - 뱃지 도감에 등록된 국가 수(=여행 가능한 국가 수): %d개국 — 나의기록에 여행 국가를 기록하면 그 나라 뱃지를 자동으로 받을 수 있음
                - 지금 인기 있는 여행지: %s
                - 이번 달 추천 여행지 TOP: %s
                """.formatted(
                        java.time.LocalDate.now(),
                        stats.tripCount(), stats.userCount(), stats.travelLogCount(),
                        countryBadgeCount,
                        popularCities.isBlank() ? "정보 없음" : popularCities,
                        monthlyTop.isBlank() ? "이번 달 데이터 없음" : monthlyTop
                );
    }
}
