package com.dreamcollection.domain.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.main.entity.Notice;

public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByActiveTrueOrderByPinnedDescCreatedAtDesc();
}
