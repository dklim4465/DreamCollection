package com.dreamcollection.domain.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.dreamcollection.domain.chat.entity.ChatMessage;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomIdOrderBySentAtAsc(Long roomId);
    long countByRoomIdAndSentAtAfter(Long roomId, java.time.LocalDateTime after);
}
