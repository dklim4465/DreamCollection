package com.dreamCollection.mate.repository;

import com.dreamCollection.mate.entity.MateScheduleLink;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MateScheduleLinkRepository extends JpaRepository<MateScheduleLink, Long> {
    boolean existByRequestId(Long requestId);
    List<MateScheduleLink> findByMatePostId(Long matePostId);

}

