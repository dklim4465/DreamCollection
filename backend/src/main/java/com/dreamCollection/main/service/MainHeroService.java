package com.dreamCollection.main.service;

import com.dreamCollection.main.dto.MainHeroResponse;
import com.dreamCollection.main.dto.MainHeroResponse.HeroMedia;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

import com.dreamCollection.main.repository.MainBackgroundRepository;
import com.dreamCollection.main.repository.MonthlyDestinationRepository;
/**
 * 메인페이지 상단 배경 결정 로직.
 * 우선순위: 로그인+다가오는 일정 있음 > 이달의 여행지 > 기본 배경
 *
 * TODO(trip 담당자): "로그인 + 다가오는 일정(SCHEDULE)" 우선순위는 trip 도메인 쪽 구조가
 * 아직 이 브랜치와 정리되지 않아 이번 병합에서는 제외했습니다. trip 쪽 구조가 정해지면
 * (예: 사용자별 다가오는 여행 조회 메서드) 여기에 다시 연결해주세요.
 */
@Service
@RequiredArgsConstructor
public class MainHeroService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    // 관리자가 아직 배경을 등록하지 않았을 때 쓰는 기본 슬라이드(고품질 여행지 사진).
    // 예전엔 "/images/default-hero.jpg"라는 실제로 존재하지 않는 로컬 경로라 깨진 이미지로 보였음.
    private static final List<HeroMedia> DEFAULT_FALLBACK_MEDIAS = List.of(
            new HeroMedia("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80", "IMAGE"), // 산토리니
            new HeroMedia("https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80", "IMAGE"), // 발리
            new HeroMedia("https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80", "IMAGE"), // 도쿄
            new HeroMedia("https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80", "IMAGE")  // 파리
    );

    private final MonthlyDestinationRepository monthlyDestinationRepository;
    private final MainBackgroundRepository mainBackgroundRepository;

    @Transactional(readOnly = true)
    public MainHeroResponse getHero(Long userId) {
        // 1순위(다가오는 일정)는 trip 도메인 정리 후 연결 예정 — 현재는 2순위부터 시작

        // 2순위: 이달의 여행지 — 전부 내려줘서 프론트가 여러 개를 순환 노출 (매번/주기적으로 다른 여행지가 보이도록)
        String currentMonth = LocalDate.now().format(MONTH_FORMAT);
        var monthlyList = monthlyDestinationRepository
                .findByDisplayMonthAndActiveTrueOrderByDisplayOrderAsc(currentMonth);
        if (!monthlyList.isEmpty()) {
            List<HeroMedia> monthlyMedias = monthlyList.stream()
                    .map(md -> new HeroMedia(md.getImageUrl(), "IMAGE", md.getTitle(), md.getDestinationName()))
                    .toList();
            var first = monthlyList.get(0);
            return new MainHeroResponse(
                    "MONTHLY", first.getImageUrl(), "IMAGE", first.getTitle(), first.getDestinationName(), null, monthlyMedias);
        }

        // 3순위: 관리자 기본 배경 — 여러 개 등록돼 있으면 전부 내려줘서 프론트가 슬라이드로 순환시킴
        var backgrounds = mainBackgroundRepository.findByActiveTrue();
        List<HeroMedia> medias = backgrounds.isEmpty()
                ? DEFAULT_FALLBACK_MEDIAS
                : backgrounds.stream().map(bg -> new HeroMedia(bg.getMediaUrl(), bg.getMediaType())).toList();

        return new MainHeroResponse(
                "DEFAULT", medias.get(0).url(), medias.get(0).type(), "오늘은 어디로 떠나볼까요?", null, null, medias);
    }
}
