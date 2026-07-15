package com.dreamCollection.board.repository;

import com.dreamCollection.social.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BoardNotificationRepository extends JpaRepository<Notification, Long> {
}