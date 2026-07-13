package com.dreamCollection.level;

import java.util.List;

/**
 * 마이페이지 "레벨 시스템" — 여행 횟수 기준 레벨 테이블.
 *
 * 담당자 확인: 결제(여행) 완료 횟수를 기준으로 레벨을 올리기로 함.
 * 단, 실제 결제(trip_payments) 완료 데이터는 아직 프론트 mock(localStorage)만 있고
 * 백엔드에 영속화되어 있지 않아서, 현재는 실제로 저장(saved_trips)된
 * "AI 추천 여행 저장" 횟수를 임시 기준으로 사용한다.
 * → 나중에 trip_payments가 실제로 붙으면 결제 완료 건수로 바꿔주면 된다
 *   (LevelService에서 카운트 소스만 교체하면 되도록 분리해둠).
 *
 * 레벨 구간은 우선 잡아둔 값이라, 밸런스는 이 표만 고치면 조정 가능.
 */
public final class LevelPolicy {

    public record Tier(int level, int requiredTripCount) {}

    private static final List<Tier> TIERS = List.of(
            new Tier(1, 0),
            new Tier(2, 1),
            new Tier(3, 3),
            new Tier(4, 5),
            new Tier(5, 8),
            new Tier(6, 12),
            new Tier(7, 18),
            new Tier(8, 25),
            new Tier(9, 35),
            new Tier(10, 50)
    );

    private LevelPolicy() {}

    /** 여행 횟수에 해당하는 현재 레벨 */
    public static int levelFor(long tripCount) {
        int level = TIERS.get(0).level();
        for (Tier tier : TIERS) {
            if (tripCount >= tier.requiredTripCount()) {
                level = tier.level();
            } else {
                break;
            }
        }
        return level;
    }

    /** 다음 레벨로 올라가는 데 필요한 여행 횟수 기준점. 이미 최고 레벨이면 null */
    public static Integer nextThreshold(long tripCount) {
        for (Tier tier : TIERS) {
            if (tripCount < tier.requiredTripCount()) {
                return tier.requiredTripCount();
            }
        }
        return null;
    }

    public static int maxLevel() {
        return TIERS.get(TIERS.size() - 1).level();
    }
}
