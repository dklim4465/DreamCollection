package com.dreamCollection.chat.repository;

import com.dreamCollection.chat.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepository extends JpaRepository<Friendship, Long> {

    @Query("""
        SELECT f FROM Friendship f
        WHERE (f.requesterId = :userId1 AND f.receiverId = :userId2)
           OR (f.requesterId = :userId2 AND f.receiverId = :userId1)
        """)
    Optional<Friendship> findBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    List<Friendship> findByReceiverIdAndStatus(Long receiverId, String status);

    List<Friendship> findByRequesterIdAndStatus(Long requesterId, String status);

    @Query("""
        SELECT f FROM Friendship f
        WHERE (f.requesterId = :userId OR f.receiverId = :userId)
          AND f.status = 'ACCEPTED'
        """)
    List<Friendship> findAcceptedFriendships(@Param("userId") Long userId);
}