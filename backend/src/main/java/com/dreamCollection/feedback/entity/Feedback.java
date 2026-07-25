package com.dreamCollection.feedback.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 255)
    private String email;

    @Column(nullable = false, length = 20)
    private String category; // BUG | SUGGESTION | ETC

    @Lob
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Builder.Default
    @Column(nullable = false)
    private boolean checked = false; // 관리자가 확인했는지 (읽음 표시용)

    // 로그인한 상태로 문의를 보낸 경우에만 채워짐 (비로그인 방문자는 null)
    @Column(name = "user_id")
    private Long userId;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String answer; // 관리자 답변 내용 (아직 답변 안했으면 null)

    @Column(name = "answered_at")
    private LocalDateTime answeredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public void markChecked() {
        this.checked = true;
    }

    public void answer(String answer) {
        this.answer = answer;
        this.answeredAt = LocalDateTime.now();
        this.checked = true;
    }
}
