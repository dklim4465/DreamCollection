// src/main/java/com/dreamCollection/mate/dto/AuthorLevelBadgeInfo.java
package com.dreamCollection.mate.dto;

/**
 * 메이트 목록 카드에 닉네임과 같이 노출할 작성자 레벨/대표뱃지 정보.
 * 대표뱃지가 없으면 badgeName/badgeIconUrl/badgeConditionType은 null.
 */
public record AuthorLevelBadgeInfo(
        int level,
        String badgeName,
        String badgeIconUrl,
        String badgeConditionType
) {
}