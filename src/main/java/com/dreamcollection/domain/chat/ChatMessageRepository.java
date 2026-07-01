package com.dreamcollection.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdOrderBySentAtAsc(Long roomId);
    long countByRoomIdAndSentAtAfter(Long roomId, java.time.LocalDateTime after);
}
