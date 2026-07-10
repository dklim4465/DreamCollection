package com.dreamCollection.flight.api.serp;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SerpFlightApiCaller {
    // SerpAPI에 실제 HTTP 요청을 보내는곳

    private final RestClient restClient = RestClient.create();

    @Value("${serpapi.api-key}")
    private String apiKey;

    public JsonNode call(Map<String, String> queryParams) {
        return restClient.get()
                .uri(uriBuilder -> {
                    uriBuilder
                            .scheme("https")
                            .host("serpapi.com")
                            .path("/search")
                            .queryParam("api_key", apiKey);

                    queryParams.forEach(uriBuilder::queryParam);

                    return uriBuilder.build();
                })
                .retrieve()
                .body(JsonNode.class);
    }
}