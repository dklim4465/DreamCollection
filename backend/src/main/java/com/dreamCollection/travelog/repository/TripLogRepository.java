package com.dreamCollection.travelog.repository;

import com.dreamCollection.travelog.domain.TripLog;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripLogRepository extends JpaRepository<TripLog, Long> {

    @EntityGraph(attributePaths = "tags")
    Optional<TripLog> findById(Long id);

    @EntityGraph(attributePaths = "tags")
    List<TripLog> findAll();
}
