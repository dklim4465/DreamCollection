package com.dreamcollection.travelog.repository;

import com.dreamcollection.travelog.domain.TripLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TripLogRepository extends JpaRepository<TripLog, Long> {

    @EntityGraph(attributePaths = "tags")
    Optional<TripLog> findById(Long id);
}
