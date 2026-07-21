package com.dreamCollection.trip.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;


import java.util.Map;

@Log4j2
@Component
public class TripAiClientComponent implements TripAiClient{


    @Value("${ai.server.base-url}")
    private String aiServerBaseUrl;

    @Override
    public String recommend(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return "AI_EMPTY_PROMPT";
        }

        Map<String, Object> requestBody = Map.of(
                "prompt", prompt,
                "task", "trip_recommend"
        );

        String url = aiServerBaseUrl + "/v1/generate";

        try {
            String response = restClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            String text = node.path("text").asText("");

            if (text.isBlank()) {
                log.warn("AI server empty text: {}", response);
                return "AI_EMPTY_RESPONSE";
            }

            log.info("Trip AI response length={}", text.length());
            return text;
        } catch (Exception e) {
            log.error("AI server 호출 실패 url={}", url, e);
            return "AI_CALL_FAILED";
        }
    }
    private final RestClient restClient = RestClient.builder()
            .requestFactory(timeoutRequestFactory())
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private static SimpleClientHttpRequestFactory timeoutRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(30_000);
        return factory;
    }

}
