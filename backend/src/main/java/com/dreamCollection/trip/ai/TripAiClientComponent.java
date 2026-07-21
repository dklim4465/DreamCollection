package com.dreamCollection.trip.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Log4j2
@Component
public class TripAiClientComponent implements TripAiClient{


    @Override
    public String recommend(String prompt) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("GEMINI_API_KEY 없음");
            return "AI_KEY_MISSING";
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", prompt))
                        )
                ),
                "generationConfig", Map.of("maxOutputTokens", MAX_OUTPUT_TOKENS)
        );

        String url = API_URL_TEMPLATE.formatted(model);

        try {
            String response = restClient.post()
                    .uri(url)
                    .header("x-goog-api-key", apiKey)
                    .header("Content-Type", "application/json")
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            JsonNode text = node.path("candidates").path(0)
                    .path("content").path("parts").path(0).path("text");

            if (!text.isMissingNode() && !text.asText("").isBlank()) {
                String result = text.asText();
                log.info("Trip AI response length={}", result.length());
                return result;
            }

            log.warn("Trip AI empty text: {}", response);
            return "AI_EMPTY_RESPONSE";
        } catch (Exception e) {
            log.error("Trip AI Gemini 호출 실패", e);
            return "AI_CALL_FAILED";
        }
    }


    private static final String API_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

    private static final int MAX_OUTPUT_TOKENS = 2048; // 일정 JSON은 챗봇보다 길 수 있음

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

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
