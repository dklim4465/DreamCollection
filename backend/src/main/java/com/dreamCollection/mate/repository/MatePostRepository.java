package com.dreamCollection.mate.repository;

import com.dreamCollection.mate.entity.MatePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatePostRepository extends JpaRepository<MatePost, Long> {
    Page<MatePost> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<MatePost> findByDestinationContaining(String keyword, Pageable pageable);
    Page<MatePost> findByUserId(Long userId, Pageable pageable);
}
