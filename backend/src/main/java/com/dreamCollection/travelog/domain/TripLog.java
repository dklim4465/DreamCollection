package com.dreamCollection.travelog.domain;

import com.dreamCollection.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString(exclude = {"tags", "user"})
@Table(name = "trip_log")
@EntityListeners(AuditingEntityListener.class)
public class TripLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tno;

    @CreatedDate
    @Column(updatable = false, nullable = false, columnDefinition = "timestamp")
    private Instant createdAt;

    @LastModifiedDate
    @Column(nullable = false, columnDefinition = "timestamp")
    private Instant modifiedAt;

    private String title;

    private LocalDate startDate;

    private LocalDate endDate;

    private String thumbnailPath;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @ElementCollection
    @Builder.Default
    private List<String> tags = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public void changeTitle(String title) { this.title = title; }

    public void changeStartDate(LocalDate startDate) { this.startDate = startDate; }

    public void changeEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public void changeDesc(String description) {
        this.description = description;
    }

    public void changeThumbnail(String thumbnailPath) {
        this.thumbnailPath = thumbnailPath;
    }

    public void addTag(String tag) {
        tags.add(tag);
    }

    public void clearTags() {
        tags.clear();
    }

    public void changeUser(User user) { this.user = user; }
}