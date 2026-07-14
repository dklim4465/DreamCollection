package com.dreamCollection.chat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

import com.dreamCollection.chat.entity.ChatRoom;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    Optional<ChatRoom> findByMatePostId(Long matePostId);

    @Query("""
        SELECT crm1.roomId FROM ChatRoomMember crm1
        JOIN ChatRoomMember crm2 ON crm1.roomId = crm2.roomId
        JOIN ChatRoom cr ON cr.id = crm1.roomId
        JOIN MatePost mp ON mp.id = cr.matePostId
        WHERE crm1.userId = :userId1 AND crm2.userId = :userId2
          AND mp.status = 'DM'
        """)
    Optional<Long> findDmRoomIdBetween(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}