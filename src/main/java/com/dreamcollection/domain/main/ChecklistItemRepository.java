package com.dreamcollection.domain.main;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    List<ChecklistItem> findByRequestIdOrderByDisplayOrderAsc(Long requestId);
}
