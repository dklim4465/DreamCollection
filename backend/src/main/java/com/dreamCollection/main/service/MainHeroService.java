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
 * "이달의 여행지"와 "관리자 기본 배경"을 하나로 합쳐서 함께 슬라이드로 순환 노출한다.
 * (둘 다 없을 때만 기본 폴백 이미지 사용)
 *
 * TODO(trip 담당자): "로그인 + 다가오는 일정(SCHEDULE)" 우선순위는 trip 도메인 쪽 구조가
 * 아직 이 브랜치와 정리되지 않아 이번 병합에서는 제외했습니다. trip 쪽 구조가 정해지면
 * (예: 사용자별 다가오는 여행 조회 메서드) 여기에 다시 연결해주세요.
 */
@Service
@RequiredArgsConstructor
public class MainHeroService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyy-MM");

    // 이달의 여행지도, 관리자 등록 배경도 하나도 없을 때 쓰는 기본 슬라이드(고품질 여행지 사진).
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

        // 이달의 여행지 — 여행지별 제목/부제(도시명)을 함께 내려줌
        String currentMonth = LocalDate.now().format(MONTH_FORMAT);
        var monthlyList = monthlyDestinationRepository
                .findByDisplayMonthAndActiveTrueOrderByDisplayOrderAsc(currentMonth);
        List<HeroMedia> monthlyMedias = monthlyList.stream()
                .map(md -> new HeroMedia(md.getImageUrl(), "IMAGE", md.getTitle(), md.getDestinationName()))
                .toList();

        // 관리자 기본 배경 — 별도의 제목/부제 없이 사진(또는 영상)만
        var backgrounds = mainBackgroundRepository.findByActiveTrue();
        List<HeroMedia> backgroundMedias = backgrounds.stream()
                .map(bg -> new HeroMedia(bg.getMediaUrl(), bg.getMediaType()))
                .toList();

        // 이달의 여행지 + 관리자 배경을 하나의 슬라이드 목록으로 합침 (순서: 이달의 여행지 먼저, 그다음 관리자 배경)
        List<HeroMedia> medias = new java.util.ArrayList<>(monthlyMedias.size() + backgroundMedias.size());
        medias.addAll(monthlyMedias);
        medias.addAll(backgroundMedias);
        if (medias.isEmpty()) {
            medias = DEFAULT_FALLBACK_MEDIAS;
        }

        HeroMedia first = medias.get(0);
        // mode: 이달의 여행지가 하나라도 있으면 "MONTHLY"(대표 문구가 여행지명), 없으면 "DEFAULT"
        String mode = monthlyMedias.isEmpty() ? "DEFAULT" : "MONTHLY";
        String title = first.title() != null ? first.title() : "오늘은 어디로 떠나볼까요?";

        return new MainHeroResponse(mode, first.url(), first.type(), title, first.subtitle(), null, medias);
    }
}
