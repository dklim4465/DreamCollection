package com.dreamcollection.domain.social.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.social.entity.Block;

public interface BlockRepository extends JpaRepository<Block, Long> {
    List<Block> findByUserId(Long userId);
    boolean existsByUserIdAndBlockedUserId(Long userId, Long blockedUserId);
}
