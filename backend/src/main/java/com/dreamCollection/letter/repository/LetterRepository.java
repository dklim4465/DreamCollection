package com.dreamCollection.letter.repository;

import com.dreamCollection.letter.entity.Letter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LetterRepository extends JpaRepository<Letter, Long> {
    Page<Letter> findAllByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Optional<Letter> findByIdAndUserId(Long id, Long userId);

    long countByUserIdAndReadFalse(Long userId);

    void deleteByIdAndUserId(Long id, Long userId);
}
