package com.dreamcollection.travelog.domain;

import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Builder
@ToString(exclude = {"tripLog", "medias"})
@Table(name = "trip_spot")
public class Spot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sno;

    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Point centerLocation;

    @Column(nullable = false, columnDefinition = "timestamp")
    private Instant visitAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SpotType spotType;

    private String timezone;

    @Column(length = 2, columnDefinition = "CHAR(2)")
    private String country;

    @Column(length = 3, columnDefinition = "CHAR(3)")
    private String iataCode;

    private String coverImagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false)
    private TripLog tripLog;

    @OneToMany(mappedBy = "spot", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Media> medias = new ArrayList<>();

    public void changeName(String name) {
        this.name = name;
    }

}
