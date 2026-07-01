package com.dreamcollection.domain.chat;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, Long> {
    List<ChatRoomMember> findByRoomId(Long roomId);
    List<ChatRoomMember> findByUserId(Long userId);
    Optional<ChatRoomMember> findByRoomIdAndUserId(Long roomId, Long userId);
}
