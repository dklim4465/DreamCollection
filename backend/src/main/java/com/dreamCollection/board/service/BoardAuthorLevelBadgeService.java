// src/main/java/com/dreamCollection/board/service/BoardAuthorLevelBadgeService.java
package com.dreamCollection.board.service;

import com.dreamCollection.badge.entity.Badge;
import com.dreamCollection.badge.entity.UserBadge;
import com.dreamCollection.badge.repository.BadgeRepository;
import com.dreamCollection.badge.repository.UserBadgeRepository;
import com.dreamCollection.board.dto.AuthorLevelBadgeInfo;
import com.dreamCollection.level.LevelPolicy;
import com.dreamCollection.trip.repository.SavedTripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * 게시판 목록 카드에서 작성자 레벨 + 대표뱃지를 조회하는 용도.
 * 레벨 계산은 LevelService.getMyLevel과 동일한 기준(saved_trips 개수)을 재사용.
 */
@Service
@RequiredArgsConstructor
public class BoardAuthorLevelBadgeService {

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