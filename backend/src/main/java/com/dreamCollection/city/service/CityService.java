package com.dreamCollection.city.service;

import com.dreamCollection.city.dto.CityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import com.dreamCollection.city.repository.CityRepository;

@Service
@RequiredArgsConstructor
public class CityService {

    private final CityRepository cityRepository;

    // 일정 생성 화면 / 상단 검색바의 목적지 자동완성 검색
    // 도시명(한글/영문)뿐 아니라 국가명("일본" 등)으로 검색해도 매칭되도록 함
    @Transactional(readOnly = true)
    public List<CityResponse> search(String keyword) {
        return cityRepository.searchByKeyword(keyword).stream()
                .map(CityResponse::from)
                .toList();
    }

    // 자동완성 진입 전 기본 노출용 (인기 도시 목록)
    @Transactional(readOnly = true)
    public List<CityResponse> getPopularCities() {
        return cityRepository.findByPopularTrueAndActiveTrueOrderById().stream()
                .map(CityResponse::from)
                .toList();
    }
}
