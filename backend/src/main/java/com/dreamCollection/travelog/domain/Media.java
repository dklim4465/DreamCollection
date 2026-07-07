package com.dreamCollection.travelog.domain;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

import java.time.Instant;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString(exclude = "tripLog")
@Table(name="media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long mno;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType mediaType;

    @Column(nullable = false)
    private String storedFileName;

    private Long fileSize;

    private String mimeType;

    private Point location;

    @Column(columnDefinition = "TEXT")
    private String mediaText;

    @Column(nullable = false)
    private String mediaPath;

    @Column(columnDefinition = "timestamp")
    private Instant takenAt;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private TripLog tripLog;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "spot_id")
    private Spot spot;

    public void changeSpot(Spot spot) {
        this.spot = spot;
    }

    public void changeType(MediaType type) {
        this.mediaType = type;
    }
}
