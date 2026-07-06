package com.dreamCollection.board.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.board.entity.BoardImage;

public interface BoardImageRepository extends JpaRepository<BoardImage, Long> {
    List<BoardImage> findByPostIdOrderByOrderNoAsc(Long postId);
}
