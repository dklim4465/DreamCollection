package com.dreamCollection.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.user.entity.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {

    // 마이페이지 "최근 로그인 기록" — 최근 20건만 보여주면 충분
    List<LoginHistory> findTop20ByUserIdOrderByCreatedAtDesc(Long userId);
}
