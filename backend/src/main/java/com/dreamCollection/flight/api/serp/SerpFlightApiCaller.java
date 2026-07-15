package com.dreamCollection.flight.api.serp;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Log4j2
public class SerpFlightApiCaller {
    // SerpAPI에 실제 HTTP 요청을 보내는곳

    private final RestClient restClient = RestClient.create();

    @Value("${serpapi.api-key}")
    private String apiKey;

    public JsonNode call(Map<String, String> queryParams) {


        log.info(
                "[SerpAPI CALL] type={}, departure_id={}, arrival_id={}, outbound_date={}, return_date={}, hasDepartureToken={}",
                queryParams.get("type"),
                queryParams.get("departure_id"),
                queryParams.get("arrival_id"),
                queryParams.get("outbound_date"),
                queryParams.get("return_date"),
                queryParams.containsKey("departure_token")
        );


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