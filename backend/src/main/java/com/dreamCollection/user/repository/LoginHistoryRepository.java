package com.dreamCollection.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamCollection.user.entity.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
}
