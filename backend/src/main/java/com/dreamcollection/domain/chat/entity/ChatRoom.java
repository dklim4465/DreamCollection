package com.dreamcollection.domain.chat.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_room")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mate_post_id", nullable = false)
    private Long matePostId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public ChatRoom(Long matePostId) {
        this.matePostId = matePostId;
    }
}
