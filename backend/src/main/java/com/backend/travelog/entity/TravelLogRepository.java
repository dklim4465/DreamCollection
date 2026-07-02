package com.backend.travelog;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TravelLogRepository extends JpaRepository<TravelLog, Long> {
    List<TravelLog> findByUserIdOrderByCreatedAtDesc(Long userId);
}
