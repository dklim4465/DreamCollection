package com.dreamCollection.board.repository;

import com.dreamCollection.social.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface BoardNotificationQueryRepository extends JpaRepository<Notification, Long> {

    Page<Notification> findByUserIdAndCreatedAtAfterOrUserIdAndReadFalseOrderByCreatedAtDesc(
            Long userId1, LocalDateTime cutoff, Long userId2, Pageable pageable);

    default Page<Notification> findVisibleByUserId(Long userId, LocalDateTime cutoff, Pageable pageable) {
        return findByUserIdAndCreatedAtAfterOrUserIdAndReadFalseOrderByCreatedAtDesc(userId, cutoff, userId, pageable);
    }
}