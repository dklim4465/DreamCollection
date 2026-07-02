package com.dreamcollection.domain.city;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    // 목적지 자동완성 검색
    List<City> findByNameKoContainingAndActiveTrue(String keyword);
    List<City> findByPopularTrueAndActiveTrueOrderById();
}
