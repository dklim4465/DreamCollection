package com.dreamcollection.domain.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.dreamcollection.domain.chat.entity.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByMatePostId(Long matePostId);
}
