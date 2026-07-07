package com.dreamCollection.travelog.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.travelog.entity.TravelLog;

public interface TravelLogRepository extends JpaRepository<TravelLog, Long> {
    List<TravelLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
