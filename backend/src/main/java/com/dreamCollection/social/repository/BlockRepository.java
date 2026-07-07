package com.dreamCollection.social.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.social.entity.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {
    List<Block> findByUserId(Long userId);
    boolean existsByUserIdAndBlockedUserId(Long userId, Long blockedUserId);
}
