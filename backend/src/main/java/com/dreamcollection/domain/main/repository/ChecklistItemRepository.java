package com.dreamcollection.domain.main.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.main.entity.ChecklistItem;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    List<ChecklistItem> findByRequestIdOrderByDisplayOrderAsc(Long requestId);
}
