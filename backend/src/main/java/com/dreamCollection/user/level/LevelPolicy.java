package com.dreamCollection.user.level;

import java.util.List;

/**
 * 마이페이지 "레벨 시스템" — 여행 횟수 기준 레벨 테이블.
 *
 * 목표 기준은 결제 완료(PaymentOrder status=PAID) 횟수.
 * 현재 LevelService는 아직 saved_trips(여행 저장) 건수를 임시로 사용한다.
 * → PaymentOrder 기준으로 바꿀 때는 LevelService의 카운트 소스만 교체하면 된다.
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
