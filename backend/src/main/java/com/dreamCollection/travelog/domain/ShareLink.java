package com.dreamCollection.travelog.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;

import java.time.Instant;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString(exclude = "tripLog")
@Table(name = "share_link")
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private TripLog tripLog;

    @Setter
    private boolean active;

    private ShareType shareType;

    @CreatedDate
    @Column(updatable = false, nullable = false, columnDefinition = "timestamp")
    private Instant createdAt;

    private Instant expiredAt;

    public boolean isAvailable() {
        return active && (expiredAt == null || expiredAt.isAfter(Instant.now()));
    }

}
