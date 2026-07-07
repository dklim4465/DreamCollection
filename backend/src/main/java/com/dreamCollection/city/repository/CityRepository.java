package com.dreamCollection.city.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.city.entity.City;

public interface CityRepository extends JpaRepository<City, Long> {
    // 목적지 자동완성 검색
    List<City> findByNameKoContainingAndActiveTrue(String keyword);
    List<City> findByPopularTrueAndActiveTrueOrderById();
}
