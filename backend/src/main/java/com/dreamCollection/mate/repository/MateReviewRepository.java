package com.dreamCollection.mate.repository;

import com.dreamCollection.mate.entity.MateReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MateReviewRepository extends JpaRepository<MateReview, Long> {
    List<MateReview> findByRevieweeId(Long revieweeId);
}
