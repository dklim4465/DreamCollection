package com.dreamCollection.city.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

import com.dreamCollection.city.entity.City;

public interface CityRepository extends JpaRepository<City, Long> {
    // 목적지 자동완성 검색 (도시명은 기존 방식대로 유지 — 하위 호환용, 현재는 안 씀)
    List<City> findByNameKoContainingAndActiveTrue(String keyword);
    List<City> findByPopularTrueAndActiveTrueOrderById();

    // 도시명(한글/영문) 또는 국가명으로 검색 — "일본"처럼 국가명을 검색해도
    // 그 나라의 도시들이 전부 나오도록 함
    @Query("SELECT c FROM City c WHERE c.active = true AND "
            + "(c.nameKo LIKE CONCAT('%', :keyword, '%') "
            + "OR c.nameEn LIKE CONCAT('%', :keyword, '%') "
            + "OR c.countryName LIKE CONCAT('%', :keyword, '%')) "
            + "ORDER BY c.popular DESC, c.id ASC")
    List<City> searchByKeyword(@Param("keyword") String keyword);

    // 홈 화면 통계("숫자로 보는 Dream Collection")용 — 지원하는 여행지 국가 수
    @Query("SELECT COUNT(DISTINCT c.countryCode) FROM City c")
    long countDistinctCountryCode();
}