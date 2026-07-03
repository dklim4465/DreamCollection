package com.dreamcollection.domain.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import com.dreamcollection.domain.chat.entity.ChatRoomMember;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    List<ChatRoomMember> findByRoomId(Long roomId);
    List<ChatRoomMember> findByUserId(Long userId);
    Optional<ChatRoomMember> findByRoomIdAndUserId(Long roomId, Long userId);
}
