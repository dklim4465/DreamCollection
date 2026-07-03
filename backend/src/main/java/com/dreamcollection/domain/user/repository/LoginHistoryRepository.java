package com.dreamcollection.domain.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamcollection.domain.user.entity.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
}
