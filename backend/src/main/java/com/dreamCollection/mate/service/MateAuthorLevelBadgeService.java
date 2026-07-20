// src/main/java/com/dreamCollection/mate/service/MateAuthorLevelBadgeService.java
package com.dreamCollection.mate.service;

import com.dreamCollection.badge.entity.Badge;
import com.dreamCollection.badge.entity.UserBadge;
import com.dreamCollection.badge.repository.BadgeRepository;
import com.dreamCollection.badge.repository.UserBadgeRepository;
import com.dreamCollection.user.level.LevelPolicy;
import com.dreamCollection.mate.dto.AuthorLevelBadgeInfo;
import com.dreamCollection.trip.repository.SavedTripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 메이트 목록 카드에서 작성자 레벨 + 대표뱃지를 조회하는 용도.
 * 레벨 계산은 LevelService.getMyLevel과 동일한 기준(saved_trips 개수)을 재사용.
 */
@Service
@RequiredArgsConstructor
public class MateAuthorLevelBadgeService {

    private final SavedTripRepository savedTripRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final BadgeRepository badgeRepository;

    public AuthorLevelBadgeInfo resolve(Long userId) {
        long tripCount = savedTripRepository.countByUserId(userId);
        int level = LevelPolicy.levelFor(tripCount);

        Optional<UserBadge> representative = userBadgeRepository.findByUserIdAndRepresentativeTrue(userId);
        if (representative.isEmpty()) {
            return new AuthorLevelBadgeInfo(level, null, null, null);
        }

        Badge badge = badgeRepository.findById(representative.get().getBadgeId()).orElse(null);
        if (badge == null) {
            return new AuthorLevelBadgeInfo(level, null, null, null);
        }

        return new AuthorLevelBadgeInfo(level, badge.getName(), badge.getIconUrl(), badge.getConditionType());
    }
}