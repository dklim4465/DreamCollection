package com.dreamcollection.domain.badge.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.dreamcollection.domain.badge.entity.Badge;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByCode(String code);
}
