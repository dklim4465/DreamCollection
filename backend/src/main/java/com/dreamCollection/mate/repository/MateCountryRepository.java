package com.dreamCollection.mate.repository;

import com.dreamCollection.city.entity.City;
import com.dreamCollection.mate.dto.CountryResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

/**
 * city 패키지 파일은 건드리지 않고, mate 도메인 자체 필요(국가 필터)로
 * City 엔티티를 조회하기 위한 전용 repository.
 */
public interface MateCountryRepository extends JpaRepository<City, Long> {

    // 메이트 국가 필터용 — is_popular과 상관없이 활성화된 도시가 있는 국가 전체
    @Query("SELECT DISTINCT c.countryCode AS countryCode, c.countryName AS countryName "
            + "FROM City c WHERE c.active = true ORDER BY c.countryName ASC")
    List<CountryResponseDTO> findDistinctCountries();
}