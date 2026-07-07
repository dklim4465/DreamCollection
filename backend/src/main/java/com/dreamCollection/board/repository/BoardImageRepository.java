package com.dreamCollection.board.repository;

import com.dreamCollection.board.entity.BoardImage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface BoardImageRepository extends JpaRepository<BoardImage, Long> {
    List<BoardImage> findByPostIdOrderByOrderNoAsc(Long postId);
}