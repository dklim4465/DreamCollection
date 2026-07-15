package com.dreamCollection.place.service;

import com.dreamCollection.place.api.SerpPlaceApiCaller;
import com.dreamCollection.place.api.SerpPlaceMapper;
import com.dreamCollection.place.api.SerpPlaceQueryBuilder;
import com.dreamCollection.place.dto.PlaceSyncResponse;
import com.dreamCollection.place.entity.Place;
import com.dreamCollection.place.entity.PlaceCategory;
import com.dreamCollection.place.entity.PlaceSource;
import com.dreamCollection.place.repository.PlaceRepository;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlaceSyncServiceImpl implements PlaceSyncService {

    private final PlaceRepository placeRepository;
    private final SerpPlaceApiCaller apiCaller;
    private final SerpPlaceQueryBuilder queryBuilder;
    private final SerpPlaceMapper mapper;

    @Override
    @Transactional
    public PlaceSyncResponse syncTokyoPlaces(String city) {
        Map<PlaceCategory, String> keywords = tokyoKeywords();

        int inserted = 0;
        int skipped = 0;

        for (Map.Entry<PlaceCategory, String> entry : keywords.entrySet()) {
            PlaceCategory category = entry.getKey();
            String keyword = entry.getValue();

            JsonNode response = apiCaller.call(queryBuilder.build(city, category, keyword));
            JsonNode localResults = response.path("local_results");

            if (!localResults.isArray()) {
                continue;
            }

            for (JsonNode node : localResults) {
                if (!mapper.isMappable(node)) {
                    skipped++;
                    continue;
                }

                Place place = mapper.toEntity(node, city, category);

                boolean exists = placeRepository
                        .findBySourceAndExternalPlaceId(
                                PlaceSource.SERP_GOOGLE_MAPS,
                                place.getExternalPlaceId()
                        )
                        .isPresent();

                if (exists) {
                    skipped++;
                    continue;
                }

                placeRepository.save(place);
                inserted++;
            }
        }

        return new PlaceSyncResponse(city, keywords.size(), inserted, skipped);
    }

    private Map<PlaceCategory, String> tokyoKeywords() {
        Map<PlaceCategory, String> keywords = new EnumMap<>(PlaceCategory.class);

        keywords.put(PlaceCategory.ATTRACTION, "도쿄 관광명소");
        keywords.put(PlaceCategory.RESTAURANT, "도쿄 맛집");
        keywords.put(PlaceCategory.CAFE, "도쿄 카페");
        keywords.put(PlaceCategory.SHOPPING, "도쿄 쇼핑");
        keywords.put(PlaceCategory.NATURE, "도쿄 공원");
        keywords.put(PlaceCategory.CULTURE, "도쿄 박물관 미술관");
        keywords.put(PlaceCategory.ACTIVITY, "도쿄 체험 액티비티");
        keywords.put(PlaceCategory.HOTEL, "도쿄 호텔");

        return keywords;
    }
}