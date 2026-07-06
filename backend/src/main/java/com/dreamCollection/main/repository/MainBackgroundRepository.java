package com.dreamCollection.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.main.entity.MainBackground;

public interface MainBackgroundRepository extends JpaRepository<MainBackground, Long> {
    List<MainBackground> findByActiveTrue();
}
