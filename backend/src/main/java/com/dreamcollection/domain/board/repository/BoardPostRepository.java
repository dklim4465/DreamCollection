package com.dreamcollection.domain.board.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.dreamcollection.domain.board.entity.BoardPost;

public interface BoardPostRepository extends JpaRepository<BoardPost, Long> {
    Page<BoardPost> findByCategoryOrderByCreatedAtDesc(String category, Pageable pageable);
    Page<BoardPost> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    Page<BoardPost> findByTitleContainingOrContentContaining(String titleKeyword, String contentKeyword, Pageable pageable);
}
