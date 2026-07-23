package com.dreamCollection.mate.repository;

import com.dreamCollection.mate.entity.MatePost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface MatePostRepository extends JpaRepository<MatePost, Long> {
    Page<MatePost> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);
    Page<MatePost> findByStatusNotOrderByCreatedAtDesc(String excludedStatus, Pageable pageable);
    Page<MatePost> findByStatusNotInOrderByCreatedAtDesc(Collection<String> excludedStatuses, Pageable pageable);
    Page<MatePost> findByDestinationContaining(String keyword, Pageable pageable);
    Page<MatePost> findByUserId(Long userId, Pageable pageable);
    List<MatePost> findByStatusAndEndDateBefore(String status, LocalDate date);

    Page<MatePost> findByStatusAndCountryCodeOrderByCreatedAtDesc(
            String status, String countryCode, Pageable pageable);
    Page<MatePost> findByStatusNotInAndCountryCodeOrderByCreatedAtDesc(
            Collection<String> excludedStatuses, String countryCode, Pageable pageable);
}