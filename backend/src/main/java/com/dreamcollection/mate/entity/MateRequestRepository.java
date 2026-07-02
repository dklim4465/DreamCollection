package com.dreamcollection.domain.mate;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MateRequestRepository extends JpaRepository<MateRequest, Long> {
    List<MateRequest> findByMatePostId(Long matePostId);
    List<MateRequest> findByRequesterId(Long requesterId);
}
