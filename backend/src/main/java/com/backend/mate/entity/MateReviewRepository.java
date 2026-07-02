package com.backend.mate;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MateReviewRepository extends JpaRepository<MateReview, Long> {
    List<MateReview> findByRevieweeId(Long revieweeId);
}
