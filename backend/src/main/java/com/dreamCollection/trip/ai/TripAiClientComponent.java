package com.dreamCollection.trip.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Log4j2
@Component
public class TripAiClientComponent implements TripAiClient {

    @Value("${ai.server.base-url}")
    private String aiServerBaseUrl;

    private final RestClient restClient = RestClient.builder()
            .requestFactory(timeoutRequestFactory())
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public TripAiGenerateData recommend(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return null;
        }

        Map<String, Object> requestBody = Map.of(
                "prompt", prompt,
                "task", "trip_recommend"
        );

        String url = aiServerBaseUrl + "/api/v1/generate";

        try {
            String response = restClient.post()
                    .uri(url)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            TripAiGenerateResponse parsed =
                    objectMapper.readValue(response, TripAiGenerateResponse.class);

            if (parsed == null || parsed.data() == null
                    || parsed.data().days() == null
                    || parsed.data().days().isEmpty()) {
                log.warn("AI server empty data: {}", response);
                return null;
            }

            log.info("Trip AI response day count={}", parsed.data().days().size());
            return parsed.data();
        } catch (Exception e) {
            log.error("AI server call failed url={}", url, e);
            return null;
        }
    }

    private static SimpleClientHttpRequestFactory timeoutRequestFactory() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(30_000);
        return factory;
    }
}
