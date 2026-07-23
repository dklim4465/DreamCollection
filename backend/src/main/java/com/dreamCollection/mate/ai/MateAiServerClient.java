// backend/src/main/java/com/dreamCollection/mate/ai/MateAiServerClient.java
package com.dreamCollection.mate.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

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
     * ai-server 호출이 실패했을 때, 원인을 구분해서 상위 계층(Service/Controller)에
     * 전달하기 위한 예외. rateLimited=true면 Gemini 쪽 429(쿼터 초과)로 인한 실패임을 의미한다.
     */
    public static class AiUnavailableException extends RuntimeException {
        private final boolean rateLimited;

        public AiUnavailableException(String message, boolean rateLimited, Throwable cause) {
            super(message, cause);
            this.rateLimited = rateLimited;
        }

        public boolean isRateLimited() {
            return rateLimited;
        }
    }

    /**
     * @param prompt 필수 프롬프트
     * @param system 선택 시스템 프롬프트 (없으면 null)
     * @param task   선택 태스크 식별자 (없으면 null)
     * @return AI가 생성한 텍스트.
     * @throws AiUnavailableException 호출 실패/응답 이상 시. rateLimited 여부로 원인을 구분한다.
     */
    public String generate(String prompt, String system, String task) {
        Map<String, Object> body = new HashMap<>();
        body.put("prompt", prompt);
        if (system != null) body.put("system", system);
        if (task != null) body.put("task", task);

        String response;
        try {
            response = restClient.post()
                    .uri(baseUrl + "/v1/generate")
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(String.class);
        } catch (RestClientException e) {
            boolean rateLimited = isRateLimited(e);
            log.error("ai-server 호출 실패 (rateLimited={})", rateLimited, e);
            throw new AiUnavailableException("ai-server 호출 실패", rateLimited, e);
        }

        try {
            JsonNode node = objectMapper.readTree(response);
            JsonNode text = node.path("text");
            if (!text.isMissingNode() && !text.asText("").isBlank()) {
                return text.asText();
            }
            log.warn("ai-server 응답에 text가 없음: {}", response);
            throw new AiUnavailableException("ai-server 응답에 text 없음", false, null);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("ai-server 응답 파싱 실패: {}", response, e);
            throw new AiUnavailableException("ai-server 응답 파싱 실패", false, e);
        }
    }

    /**
     * 예외 메시지(응답 바디 포함)에 "429" 또는 "Too Many Requests"가 있으면
     * Gemini 쿼터 초과로 인한 실패로 판단한다.
     * ai-server가 Gemini의 429를 502로 감싸서 내려보내는 구조라 상태 코드만으로는 구분이 안 됨.
     */
    private boolean isRateLimited(Throwable e) {
        String message = e.getMessage();
        if (message == null) return false;
        return message.contains("429") || message.toLowerCase().contains("too many requests");
    }
}