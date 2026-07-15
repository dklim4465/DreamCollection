package com.dreamCollection.travelog;

import com.dreamCollection.travelog.domain.Media;
import com.dreamCollection.travelog.domain.MediaType;
import com.dreamCollection.travelog.domain.Spot;
import com.dreamCollection.travelog.domain.TripLog;
import com.dreamCollection.travelog.repository.MediaRepository;
import com.dreamCollection.travelog.repository.SpotRepository;
import com.dreamCollection.travelog.repository.TripLogRepository;
import com.dreamCollection.travelog.service.SpotService;
import com.dreamCollection.travelog.util.GeometryUtils;
import lombok.extern.log4j.Log4j2;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.annotation.Commit;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@SpringBootTest
@Log4j2
public class SpotServiceTests {

    @Autowired
    private SpotService spotService;

    @Autowired
    private TripLogRepository tripLogRepository;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private SpotRepository spotRepository;

    @Autowired
    private GeometryUtils geometryUtils;

    @Test
    @Transactional
    @Commit
    public void createDummyData() {

        TripLog trip = TripLog.builder()
                        .title("클러스터링 테스트")
                        .startDate(LocalDate.now())
                        .endDate(LocalDate.now())
                        .build();

        tripLogRepository.save(trip);

        List<Media> medias = List.of(

                // ==========================
                // Spot 1 (서울시청)
                // ==========================
                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media1")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T01:00:00Z"))
                        .location(geometryUtils.createPoint(37.5665, 126.9780))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media2")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T01:05:00Z"))
                        .location(geometryUtils.createPoint(37.5666, 126.9782))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media3")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T01:10:00Z"))
                        .location(geometryUtils.createPoint(37.5667, 126.9784))
                        .build(),


                // ==========================
                // Spot 2
                // 반경(300m) 초과
                // ==========================
                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media4")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T01:15:00Z"))
                        .location(geometryUtils.createPoint(37.5668, 126.9920))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media5")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T01:20:00Z"))
                        .location(geometryUtils.createPoint(37.5669, 126.9922))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media6")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T01:25:00Z"))
                        .location(geometryUtils.createPoint(37.5670, 126.9923))
                        .build(),


                // ==========================
                // Spot 3
                // 시간(2시간) 초과
                // ==========================
                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media7")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T04:30:00Z"))
                        .location(geometryUtils.createPoint(37.4979, 127.0276))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media8")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T04:35:00Z"))
                        .location(geometryUtils.createPoint(37.4980, 127.0278))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media9")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T04:40:00Z"))
                        .location(geometryUtils.createPoint(37.4981, 127.0280))
                        .build(),


                // ==========================
                // Spot 4
                // 반경 초과
                // ==========================
                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media10")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T04:45:00Z"))
                        .location(geometryUtils.createPoint(37.4980, 127.0325))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media11")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T04:50:00Z"))
                        .location(geometryUtils.createPoint(37.4981, 127.0327))
                        .build(),


                // ==========================
                // Spot 5
                // 속도 기준
                // 2분만에 약 9km 이동
                // ==========================
                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media12")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T04:52:00Z"))
                        .location(geometryUtils.createPoint(37.5140, 127.1025))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media13")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T04:57:00Z"))
                        .location(geometryUtils.createPoint(37.5142, 127.1027))
                        .build(),


                // ==========================
                // Spot 6
                // 속도는 느리지만 반경 초과
                // ==========================
                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media14")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T05:20:00Z"))
                        .location(geometryUtils.createPoint(37.5205, 127.1090))
                        .build(),

                Media.builder()
                        .tripLog(trip)
                        .mediaType(MediaType.ETC)
                        .storedFileName("media15")
                        .mediaPath("dummyData")
                        .takenAt(Instant.parse("2026-07-01T05:25:00Z"))
                        .location(geometryUtils.createPoint(37.5207, 127.1092))
                        .build()
        );

        mediaRepository.saveAll(medias);
    }

    @Test
    @Transactional
    @Commit
    public void clusteringTest() {

        spotService.clusteringSpot(6L);

    }

    @Test
    public void readTest() {
        List<Spot> spots = spotRepository.findAll();

        spots.forEach(log::info);
    }

    @Test
    public void tempAccount() {
        log.info(new BCryptPasswordEncoder().encode("admin1111"));
    }
}
