package com.dreamCollection.badge.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.dreamCollection.badge.entity.Badge;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByCode(String code);

    // 국가별 도감 뱃지 지급용 (condition_type=COUNTRY_VISIT)
    Optional<Badge> findByConditionTypeAndConditionCountryCode(String conditionType, String conditionCountryCode);

    // 레벨업 마일스톤 뱃지 지급용 (condition_type=LEVEL_REACHED, 현재 레벨 이하 전부)
    List<Badge> findByConditionTypeAndConditionValueLessThanEqual(String conditionType, Integer conditionValue);
}
