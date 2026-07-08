package com.dreamCollection.mate.repository;

import com.dreamCollection.mate.entity.MateRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MateRequestRepository extends JpaRepository<MateRequest, Long> {
    List<MateRequest> findByMatePostId(Long matePostId);
    List<MateRequest> findByRequesterId(Long requesterId);
    boolean existsByMatePostIdAndRequesterId(Long matePostId, Long requesterId);
    long countByMatePostIdAndStatus(Long matePostId, String status);
}
