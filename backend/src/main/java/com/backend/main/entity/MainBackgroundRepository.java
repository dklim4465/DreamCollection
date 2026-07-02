package com.backend.main;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MainBackgroundRepository extends JpaRepository<MainBackground, Long> {
    List<MainBackground> findByActiveTrue();
}
