package com.dreamCollection.level.dto;

/**
 * 프론트: levelApi.getMyLevel() → GET /api/users/me/level
 * nextLevelTripCount / tripsToNextLevel 이 둘 다 null이면 이미 최고 레벨.
 */
public record LevelResponse(
        int level,
        long tripCount,
        Integer nextLevelTripCount,
        Integer tripsToNextLevel
) {
    public static LevelResponse of(int level, long tripCount, Integer nextLevelTripCount) {
        Integer tripsToNextLevel = nextLevelTripCount == null
                ? null
                : (int) (nextLevelTripCount - tripCount);
        return new LevelResponse(level, tripCount, nextLevelTripCount, tripsToNextLevel);
    }
}
