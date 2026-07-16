package com.dreamCollection.place.api;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Log4j2
@Component
@RequiredArgsConstructor
public class SerpPlaceApiCaller {

    private final RestClient restClient = RestClient.create();

    @Value("${serpapi.api-key}")
    private String apiKey;

    public JsonNode call(Map<String, String> queryParams) {
        log.info("[Serp Place API CALL] q={}, category={}, city={}",
                queryParams.get("q"),
                queryParams.get("category"),
                queryParams.get("city")
        );

        return restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder
                            .scheme("https")
                            .host("serpapi.com")
                            .path("/search.json")
                            .queryParam("api_key", apiKey);

                    queryParams.forEach((key, value) -> {
                        if (!"category".equals(key) && !"city".equals(key)) {
                            uriBuilder.queryParam(key, value);
                        }
                    });

                    return uriBuilder.build();
                })
                .retrieve()
                .body(JsonNode.class);
    }
}