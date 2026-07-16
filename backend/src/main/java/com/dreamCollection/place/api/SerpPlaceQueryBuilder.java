package com.dreamCollection.place.api;

import com.dreamCollection.place.entity.PlaceCategory;
import org.springframework.stereotype.Component;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
public class SerpPlaceQueryBuilder {

    public Map<String, String> build(String city, PlaceCategory category, String keyword) {
        Map<String, String> params = new LinkedHashMap<>();

        params.put("engine", "google_maps");
        params.put("type", "search");
        params.put("q", keyword);
        params.put("ll", "@35.6762,139.6503,12z");
        params.put("hl", "ko");
        params.put("gl", "jp");

        // log용 내부값. 실제 SerpAPI 요청에는 제외됨.
        params.put("city", city);
        params.put("category", category.name());

        return params;
    }
}
