package com.dreamCollection.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.dreamCollection.user.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    // 마이페이지 "로그인된 기기 목록" — 폐기(로그아웃)되지 않은 세션만, 최근 로그인 순
    List<RefreshToken> findAllByUserIdAndRevokedAtIsNullOrderByCreatedAtDesc(Long userId);

    // 마이페이지 "다른 기기 로그아웃" — 본인 소유 세션인지 확인하기 위해 userId까지 함께 조회
    Optional<RefreshToken> findByIdAndUserId(Long id, Long userId);
}
