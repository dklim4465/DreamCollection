package com.dreamcollection.domain.board.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.dreamcollection.domain.board.entity.BoardLike;

public interface BoardLikeRepository extends JpaRepository<BoardLike, Long> {
    Optional<BoardLike> findByPostIdAndUserId(Long postId, Long userId);
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    void deleteByPostIdAndUserId(Long postId, Long userId);
}
