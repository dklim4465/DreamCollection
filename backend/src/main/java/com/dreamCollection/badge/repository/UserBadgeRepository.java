package com.dreamCollection.badge.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.dreamCollection.badge.entity.UserBadge;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    Optional<UserBadge> findByUserIdAndRepresentativeTrue(Long userId);
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}
