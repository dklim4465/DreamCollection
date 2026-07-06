package com.dreamCollection.board.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.board.entity.BoardComment;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {
    List<BoardComment> findByPostIdOrderByCreatedAtAsc(Long postId);
    List<BoardComment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
