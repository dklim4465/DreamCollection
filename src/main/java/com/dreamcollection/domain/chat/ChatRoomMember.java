package com.dreamcollection.domain.chat;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: chat_room_member 테이블 매핑 (안읽은 메시지 계산용 last_read_at 포함) */
@Entity
@Table(name = "chat_room_member", uniqueConstraints = @UniqueConstraint(columnNames = {"room_id", "user_id"}))
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ChatRoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Builder
    public ChatRoomMember(Long roomId, Long userId) {
        this.roomId = roomId;
        this.userId = userId;
    }

    public void markRead() {
        this.lastReadAt = LocalDateTime.now();
    }
}
