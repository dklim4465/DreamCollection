package com.dreamCollection.mate.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.Map;

/**
 * Gemini를 직접 호출하지 않고, 별도로 띄운 ai-server(Flask)의 /v1/generate를 호출하는
 * mate 도메인 전용 클라이언트. ai-server 위치는 application.properties의
 * ai.server.base-url로 설정한다.
 */
@Slf4j
@Component
public class MateAiServerClient {

    @Value("${ai.server.base-url}")
    private String baseUrl;

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

    /**
     * @param prompt 필수 프롬프트
     * @param system 선택 시스템 프롬프트 (없으면 null)
     * @param task   선택 태스크 식별자 (없으면 null)
     * @return AI가 생성한 텍스트. 호출 실패/응답 이상 시 null.
     */
    public String generate(String prompt, String system, String task) {
        Map<String, Object> body = new HashMap<>();
        body.put("prompt", prompt);
        if (system != null) body.put("system", system);
        if (task != null) body.put("task", task);

        try {
            String response = restClient.post()
                    .uri(baseUrl + "/v1/generate")
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode node = objectMapper.readTree(response);
            JsonNode text = node.path("text");
            if (!text.isMissingNode() && !text.asText("").isBlank()) {
                return text.asText();
            }
            log.warn("ai-server 응답에 text가 없음: {}", response);
            return null;
        } catch (Exception e) {
            log.error("ai-server 호출 실패", e);
            return null;
        }
    }
}