package com.dreamcollection.domain.mate;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MatePostRepository extends JpaRepository<MatePost, Long> {
    Page<MatePost> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<MatePost> findByDestinationContaining(String keyword, Pageable pageable);
    Page<MatePost> findByUserId(Long userId, Pageable pageable);
}
