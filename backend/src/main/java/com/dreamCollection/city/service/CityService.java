package com.dreamCollection.city.service;

import com.dreamCollection.city.dto.CityDetailResponse;
import com.dreamCollection.city.dto.CityResponse;
import com.dreamCollection.city.entity.City;
import com.dreamCollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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

    // 여행지 상세 페이지 — 도시 정보 + 같은 나라 다른 도시
    @Transactional(readOnly = true)
    public CityDetailResponse getCityDetail(Long id) {
        City city = cityRepository.findById(id)
                .filter(City::isActive)
                .orElseThrow(() -> new BusinessException("여행지를 찾을 수 없습니다.", HttpStatus.NOT_FOUND));

        List<City> sameCountry =
                cityRepository.findByCountryCodeAndActiveTrueAndIdNot(city.getCountryCode(), city.getId());

        return CityDetailResponse.of(city, sameCountry);
    }
}
