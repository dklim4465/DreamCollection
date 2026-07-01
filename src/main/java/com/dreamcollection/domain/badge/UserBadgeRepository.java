package com.dreamcollection.domain.badge;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);
    Optional<UserBadge> findByUserIdAndRepresentativeTrue(Long userId);
    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}
