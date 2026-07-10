package com.dreamCollection.city.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

import com.dreamCollection.city.entity.City;

public interface CityRepository extends JpaRepository<City, Long> {
    // 목적지 자동완성 검색
    List<City> findByNameKoContainingAndActiveTrue(String keyword);
    List<City> findByPopularTrueAndActiveTrueOrderById();

    // 홈 화면 통계("숫자로 보는 Dream Collection")용 — 지원하는 여행지 국가 수
    @Query("SELECT COUNT(DISTINCT c.countryCode) FROM City c")
    long countDistinctCountryCode();
}