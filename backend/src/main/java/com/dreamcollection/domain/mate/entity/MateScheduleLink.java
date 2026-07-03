package com.dreamcollection.domain.mate.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/** DB: mate_schedule_link 테이블 매핑 (메이트 모집글 - 개인 여행요청 공유 연결) */
@Entity
@Table(name = "mate_schedule_link")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MateScheduleLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mate_post_id", nullable = false)
    private Long matePostId;

    @Column(name = "request_id", nullable = false)
    private Long requestId;

    @CreationTimestamp
    @Column(name = "linked_at", nullable = false, updatable = false)
    private LocalDateTime linkedAt;

    @Builder
    public MateScheduleLink(Long matePostId, Long requestId) {
        this.matePostId = matePostId;
        this.requestId = requestId;
    }
}
