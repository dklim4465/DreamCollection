package com.dreamcollection.domain.travelog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.travelog.entity.TravelLog;

public interface TravelLogRepository extends JpaRepository<TravelLog, Long> {
    List<TravelLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
