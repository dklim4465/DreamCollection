package com.dreamCollection.travelog;

import com.dreamCollection.travelog.domain.*;
import com.dreamCollection.travelog.repository.MediaRepository;
import com.dreamCollection.travelog.repository.SpotRepository;
import com.dreamCollection.travelog.repository.TripLogRepository;
import com.dreamCollection.travelog.util.GeometryUtils;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Point;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.Rollback;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@SpringBootTest
class DummyDataInsertTest {

    @Autowired
    private TripLogRepository tripLogRepository;

    @Autowired
    private SpotRepository spotRepository;

    @Autowired
    private MediaRepository mediaRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeometryUtils geometryUtils;

    private final Random random = new Random();

    private record City(
            String title,
            String country,
            String timezone,
            double lat,
            double lon
    ) {}

    private final List<City> cities = List.of(
            new City("서울 여행", "KR", "Asia/Seoul", 37.5665, 126.9780),
            new City("부산 여행", "KR", "Asia/Seoul", 35.1796, 129.0756),
            new City("제주 여행", "KR", "Asia/Seoul", 33.4996, 126.5312),
            new City("도쿄 여행", "JP", "Asia/Tokyo", 35.6762, 139.6503),
            new City("오사카 여행", "JP", "Asia/Tokyo", 34.6937, 135.5023),
            new City("타이베이 여행", "TW", "Asia/Taipei", 25.0330, 121.5654),
            new City("싱가포르 여행", "SG", "Asia/Singapore", 1.3521, 103.8198),
            new City("방콕 여행", "TH", "Asia/Bangkok", 13.7563, 100.5018),
            new City("파리 여행", "FR", "Europe/Paris", 48.8566, 2.3522),
            new City("뉴욕 여행", "US", "America/New_York", 40.7128, -74.0060)
    );

    private final String[] spotNames = {
            "공항",
            "호텔",
            "카페",
            "맛집",
            "관광지",
            "공원",
            "시장",
            "전망대",
            "박물관",
            "쇼핑몰"
    };

    @Test
    @Transactional
    @Rollback(false)
    void insertDummyData() {

        User user = userRepository.findById(1L).orElseThrow();

        LocalDate start = LocalDate.of(2025, 1, 1);

        for (int tripIndex = 0; tripIndex < cities.size(); tripIndex++) {

            City city = cities.get(tripIndex);

            LocalDate tripStart = start.plusDays(tripIndex * 7L);
            LocalDate tripEnd = tripStart.plusDays(2 + random.nextInt(3));

            TripLog tripLog = TripLog.builder()
                    .title(city.title())
                    .description(city.title() + " 더미 데이터")
                    .thumbnailPath("/dummy/trip" + tripIndex + ".jpg")
                    .startDate(tripStart)
                    .endDate(tripEnd)
                    .user(user)
                    .build();

            tripLog.addTag(city.country());
            tripLog.addTag("TEST");

            tripLogRepository.save(tripLog);

            Instant currentTime =
                    tripStart.atStartOfDay(ZoneOffset.UTC).toInstant();

            double lat = city.lat();
            double lon = city.lon();

            int spotCount = 3 + random.nextInt(6);

            for (int s = 0; s < spotCount; s++) {

                lat += (random.nextDouble() - 0.5) * 0.02;
                lon += (random.nextDouble() - 0.5) * 0.02;

                Point center =
                        geometryUtils.createPoint(lat, lon);

                Spot spot = Spot.builder()
                        .name(spotNames[s % spotNames.length])
                        .description(spotNames[s % spotNames.length] + " 방문")
                        .centerLocation(center)
                        .visitAt(currentTime)
                        .leaveAt(currentTime.plusSeconds(7200))
                        .spotType(SpotType.ETC)
                        .spotSource(SpotSource.USER)
                        .timezone(city.timezone())
                        .country(city.country())
                        .coverImagePath("/dummy/cover.jpg")
                        .tripLog(tripLog)
                        .build();

                spotRepository.save(spot);

                currentTime = currentTime.plusSeconds(10800);

                int mediaCount = 5 + random.nextInt(11);

                for (int m = 0; m < mediaCount; m++) {

                    double mediaLat =
                            lat + (random.nextDouble() - 0.5) * 0.0003;

                    double mediaLon =
                            lon + (random.nextDouble() - 0.5) * 0.0003;

                    Point mediaPoint =
                            geometryUtils.createPoint(mediaLat, mediaLon);

                    Media media = Media.builder()
                            .mediaType(MediaType.ETC)
                            .storedFileName(UUID.randomUUID() + ".jpg")
                            .mediaPath("/dummy")
                            .fileSize(1000000L)
                            .mimeType("image/jpeg")
                            .location(mediaPoint)
                            .takenAt(currentTime.plusSeconds(m * 180))
                            .mediaText("dummy")
                            .tripLog(tripLog)
                            .spot(spot)
                            .build();

                    mediaRepository.save(media);
                }
            }
        }
    }
}

