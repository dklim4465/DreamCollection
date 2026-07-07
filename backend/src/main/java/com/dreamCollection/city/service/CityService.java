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

    // 일정 생성 화면의 목적지 자동완성 검색
    @Transactional(readOnly = true)
    public List<CityResponse> search(String keyword) {
        return cityRepository.findByNameKoContainingAndActiveTrue(keyword).stream()
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
