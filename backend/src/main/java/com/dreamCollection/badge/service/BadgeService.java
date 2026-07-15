package com.dreamCollection.badge.service;

import com.dreamCollection.badge.dto.BadgeResponse;
import com.dreamCollection.badge.entity.Badge;
import com.dreamCollection.badge.entity.UserBadge;
import com.dreamCollection.badge.repository.BadgeRepository;
import com.dreamCollection.badge.repository.UserBadgeRepository;
import com.dreamCollection.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    /**
     * 마이페이지 뱃지 목록 — 전체 활성 뱃지를 보여주되, 이 유저가 실제로 획득한 것만
     * earned=true / representative=true로 표시한다. (담당: badge 컬렉션 전체를 한 번에 조회 후 매핑)
     */
    public List<BadgeResponse> getMyBadges(Long userId) {
        List<UserBadge> myBadges = userBadgeRepository.findByUserId(userId);
        Map<Long, UserBadge> byBadgeId = myBadges.stream()
                .collect(Collectors.toMap(UserBadge::getBadgeId, ub -> ub));

        return badgeRepository.findAll().stream()
                .map(badge -> {
                    UserBadge owned = byBadgeId.get(badge.getId());
                    boolean earned = owned != null;
                    boolean representative = earned && owned.isRepresentative();
                    return BadgeResponse.of(badge, earned, representative);
                })
                .toList();
    }

    /**
     * 대표 뱃지 지정. 이 유저가 실제로 획득한 뱃지만 대표로 지정 가능하고,
     * 기존에 대표였던 다른 뱃지는 자동으로 해제된다(동시에 1개만 대표).
     */
    @Transactional
    public void setRepresentative(Long userId, Long badgeId) {
        UserBadge target = userBadgeRepository.findByUserId(userId).stream()
                .filter(ub -> ub.getBadgeId().equals(badgeId))
                .findFirst()
                .orElseThrow(() -> new BusinessException("아직 획득하지 않은 뱃지예요.", HttpStatus.FORBIDDEN));

        userBadgeRepository.findByUserIdAndRepresentativeTrue(userId)
                .ifPresent(prev -> prev.setRepresentative(false));

        target.setRepresentative(true);
    }

    /** 대표 뱃지 해제(닉네임 옆에 아무 뱃지도 안 보이게) */
    @Transactional
    public void clearRepresentative(Long userId) {
        userBadgeRepository.findByUserIdAndRepresentativeTrue(userId)
                .ifPresent(prev -> prev.setRepresentative(false));
    }

    /**
     * 뱃지 자동 지급 유틸 — 조건 달성 시 다른 서비스(결제완료, 후기작성 등)에서 호출.
     * 이미 갖고 있으면 조용히 무시(중복 지급 방지).
     */
    @Transactional
    public void grantBadge(Long userId, String badgeCode) {
        Badge badge = badgeRepository.findByCode(badgeCode)
                .orElseThrow(() -> new BusinessException("존재하지 않는 뱃지 코드예요: " + badgeCode, HttpStatus.BAD_REQUEST));
        grantIfNotOwned(userId, badge);
    }

    /**
     * 국가별 도감 뱃지 지급 — 여행 일정을 그 국가로 저장/요청했을 때 호출.
     * 해당 국가 뱃지가 없거나(도감에 없는 국가) 이미 갖고 있으면 조용히 무시.
     */
    @Transactional
    public void grantCountryBadgeIfEligible(Long userId, String countryCode) {
        if (countryCode == null || countryCode.isBlank()) return;
        badgeRepository.findByConditionTypeAndConditionCountryCode("COUNTRY_VISIT", countryCode)
                .ifPresent(badge -> grantIfNotOwned(userId, badge));
    }

    /**
     * 레벨업 마일스톤 뱃지 지급 — 레벨 조회 시마다 호출해서, 현재 레벨 이하의
     * 마일스톤 뱃지 중 아직 못 받은 게 있으면 전부 지급 (idempotent).
     */
    @Transactional
    public void grantLevelBadgesUpTo(Long userId, int level) {
        badgeRepository.findByConditionTypeAndConditionValueLessThanEqual("LEVEL_REACHED", level)
                .forEach(badge -> grantIfNotOwned(userId, badge));
    }

    private void grantIfNotOwned(Long userId, Badge badge) {
        if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) return;
        userBadgeRepository.save(UserBadge.builder().userId(userId).badgeId(badge.getId()).build());
    }
}
