package com.dreamCollection.mate.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamCollection.mate.entity.MateRequest;

public interface MateRequestRepository extends JpaRepository<MateRequest, Long> {
    List<MateRequest> findByMatePostId(Long matePostId);
    List<MateRequest> findByRequesterId(Long requesterId);
}
