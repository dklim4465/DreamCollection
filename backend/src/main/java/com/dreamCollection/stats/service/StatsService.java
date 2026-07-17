package com.dreamCollection.stats.service;

import com.dreamCollection.badge.repository.BadgeRepository;
import com.dreamCollection.badge.repository.UserBadgeRepository;
import com.dreamCollection.stats.dto.StatsResponse;
import com.dreamCollection.travelog.repository.TripLogRepository;
import com.dreamCollection.trip.repository.SavedTripRepository;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final SavedTripRepository savedTripRepository;
    private final UserRepository userRepository;
    private final TripLogRepository tripLogRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;

    public StatsResponse getStats() {
        return new StatsResponse(
                savedTripRepository.count(),
                userRepository.count(),
                tripLogRepository.count(),
                // ⚠ 예전엔 city 테이블 기준(seed 데이터가 5개 도시뿐이라 3개국으로 보임)이었는데,
                //   실제로 여행 가능한 국가는 뱃지 도감(47개국)이 훨씬 정확한 지표라서 바꿈.
                badgeRepository.countByConditionType("COUNTRY_VISIT"),
                userBadgeRepository.count()
        );
    }
}
