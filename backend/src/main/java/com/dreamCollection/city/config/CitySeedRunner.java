package com.dreamCollection.city.config;

import com.dreamCollection.city.entity.City;
import com.dreamCollection.city.repository.CityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * 조건 선택용 popular 도시 시드.
 * countryName에는 항공/UI 권역명(일본, 동남아시아 등)을 넣는다.
 * 이미 같은 nameKo가 있으면 skip.
 */
@Log4j2
@Component
@RequiredArgsConstructor
public class CitySeedRunner implements ApplicationRunner {

    private final CityRepository cityRepository;

    @Override
    public void run(ApplicationArguments args) {
        int inserted = 0;
        for (SeedCity seed : SEED_CITIES) {
            if (cityRepository.existsByNameKo(seed.nameKo())) {
                continue;
            }
            cityRepository.save(City.builder()
                    .nameKo(seed.nameKo())
                    .nameEn(seed.nameEn())
                    .countryCode(seed.countryCode())
                    .countryName(seed.region())
                    .latitude(seed.lat())
                    .longitude(seed.lng())
                    .timezone(seed.timezone())
                    .popular(true)
                    .build());
            inserted++;
        }
        if (inserted > 0) {
            log.info("City seed inserted {} cities", inserted);
        }
    }

    private record SeedCity(
            String region,
            String nameKo,
            String nameEn,
            String countryCode,
            BigDecimal lat,
            BigDecimal lng,
            String timezone
    ) {
        static SeedCity of(
                String region,
                String nameKo,
                String nameEn,
                String countryCode,
                String lat,
                String lng,
                String timezone
        ) {
            return new SeedCity(
                    region,
                    nameKo,
                    nameEn,
                    countryCode,
                    new BigDecimal(lat),
                    new BigDecimal(lng),
                    timezone
            );
        }
    }

    private static final List<SeedCity> SEED_CITIES = List.of(
            // 일본
            SeedCity.of("일본", "도쿄", "Tokyo", "JP", "35.6762", "139.6503", "Asia/Tokyo"),
            SeedCity.of("일본", "오사카", "Osaka", "JP", "34.6937", "135.5023", "Asia/Tokyo"),
            SeedCity.of("일본", "교토", "Kyoto", "JP", "35.0116", "135.7681", "Asia/Tokyo"),
            SeedCity.of("일본", "후쿠오카", "Fukuoka", "JP", "33.5904", "130.4017", "Asia/Tokyo"),
            SeedCity.of("일본", "삿포로", "Sapporo", "JP", "43.0618", "141.3545", "Asia/Tokyo"),
            SeedCity.of("일본", "나고야", "Nagoya", "JP", "35.1815", "136.9066", "Asia/Tokyo"),
            SeedCity.of("일본", "오키나와", "Okinawa", "JP", "26.2124", "127.6809", "Asia/Tokyo"),

            // 한국
            SeedCity.of("한국", "서울", "Seoul", "KR", "37.5665", "126.9780", "Asia/Seoul"),
            SeedCity.of("한국", "부산", "Busan", "KR", "35.1796", "129.0756", "Asia/Seoul"),
            SeedCity.of("한국", "제주", "Jeju", "KR", "33.4996", "126.5312", "Asia/Seoul"),
            SeedCity.of("한국", "강릉", "Gangneung", "KR", "37.7519", "128.8761", "Asia/Seoul"),

            // 동남아시아
            SeedCity.of("동남아시아", "방콕", "Bangkok", "TH", "13.7563", "100.5018", "Asia/Bangkok"),
            SeedCity.of("동남아시아", "치앙마이", "Chiang Mai", "TH", "18.7883", "98.9853", "Asia/Bangkok"),
            SeedCity.of("동남아시아", "싱가포르", "Singapore", "SG", "1.3521", "103.8198", "Asia/Singapore"),
            SeedCity.of("동남아시아", "다낭", "Da Nang", "VN", "16.0544", "108.2022", "Asia/Ho_Chi_Minh"),
            SeedCity.of("동남아시아", "호치민", "Ho Chi Minh City", "VN", "10.8231", "106.6297", "Asia/Ho_Chi_Minh"),
            SeedCity.of("동남아시아", "나트랑", "Nha Trang", "VN", "12.2388", "109.1967", "Asia/Ho_Chi_Minh"),
            SeedCity.of("동남아시아", "발리", "Bali", "ID", "-8.4095", "115.1889", "Asia/Makassar"),
            SeedCity.of("동남아시아", "세부", "Cebu", "PH", "10.3157", "123.8854", "Asia/Manila"),
            SeedCity.of("동남아시아", "보라카이", "Boracay", "PH", "11.9674", "121.9248", "Asia/Manila"),

            // 중국·대만·홍콩
            SeedCity.of("중국·대만·홍콩", "타이베이", "Taipei", "TW", "25.0330", "121.5654", "Asia/Taipei"),
            SeedCity.of("중국·대만·홍콩", "가오슝", "Kaohsiung", "TW", "22.6273", "120.3014", "Asia/Taipei"),
            SeedCity.of("중국·대만·홍콩", "홍콩", "Hong Kong", "HK", "22.3193", "114.1694", "Asia/Hong_Kong"),
            SeedCity.of("중국·대만·홍콩", "마카오", "Macau", "MO", "22.1987", "113.5439", "Asia/Macau"),
            SeedCity.of("중국·대만·홍콩", "상하이", "Shanghai", "CN", "31.2304", "121.4737", "Asia/Shanghai"),
            SeedCity.of("중국·대만·홍콩", "베이징", "Beijing", "CN", "39.9042", "116.4074", "Asia/Shanghai"),

            // 유럽
            SeedCity.of("유럽", "파리", "Paris", "FR", "48.8566", "2.3522", "Europe/Paris"),
            SeedCity.of("유럽", "런던", "London", "GB", "51.5074", "-0.1278", "Europe/London"),
            SeedCity.of("유럽", "로마", "Rome", "IT", "41.9028", "12.4964", "Europe/Rome"),
            SeedCity.of("유럽", "바르셀로나", "Barcelona", "ES", "41.3874", "2.1686", "Europe/Madrid"),
            SeedCity.of("유럽", "프라하", "Prague", "CZ", "50.0755", "14.4378", "Europe/Prague"),
            SeedCity.of("유럽", "부다페스트", "Budapest", "HU", "47.4979", "19.0402", "Europe/Budapest"),

            // 미주·대양주
            SeedCity.of("미주·대양주", "뉴욕", "New York", "US", "40.7128", "-74.0060", "America/New_York"),
            SeedCity.of("미주·대양주", "로스앤젤레스", "Los Angeles", "US", "34.0522", "-118.2437", "America/Los_Angeles"),
            SeedCity.of("미주·대양주", "하와이(호놀룰루)", "Honolulu", "US", "21.3069", "-157.8583", "Pacific/Honolulu"),
            SeedCity.of("미주·대양주", "괌", "Guam", "GU", "13.4443", "144.7937", "Pacific/Guam"),
            SeedCity.of("미주·대양주", "시드니", "Sydney", "AU", "-33.8688", "151.2093", "Australia/Sydney")
    );
}
