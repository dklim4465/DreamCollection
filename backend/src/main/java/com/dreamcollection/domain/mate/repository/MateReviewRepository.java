package com.dreamcollection.domain.mate.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.mate.entity.MateReview;

public interface MateReviewRepository extends JpaRepository<MateReview, Long> {
    List<MateReview> findByRevieweeId(Long revieweeId);
}
