package com.backend.city;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CityRepository extends JpaRepository<City, Long> {
    // 목적지 ?�동?�성 검??
    List<City> findByNameKoContainingAndActiveTrue(String keyword);
    List<City> findByPopularTrueAndActiveTrueOrderById();
}
