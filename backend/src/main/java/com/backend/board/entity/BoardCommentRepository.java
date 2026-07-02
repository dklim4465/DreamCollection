package com.backend.board;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardCommentRepository extends JpaRepository<BoardComment, Long> {
    List<BoardComment> findByPostIdOrderByCreatedAtAsc(Long postId);
    List<BoardComment> findByUserIdOrderByCreatedAtDesc(Long userId);
}
