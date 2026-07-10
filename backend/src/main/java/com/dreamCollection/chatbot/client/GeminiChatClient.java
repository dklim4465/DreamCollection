package com.dreamCollection.chatbot.client;

import com.dreamCollection.chatbot.dto.ChatMessageDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Google Gemini API 연동 — 홈페이지 "AI 여행 챗봇"의 실제 대화 응답 생성.
 *
 * 준비물:
 * 1) https://aistudio.google.com (Google AI Studio) 에서 API 키 발급
 * 2) 환경변수 GEMINI_API_KEY 로 설정 (application.yml의 gemini.api-key가 이 값을 읽음)
 *
 * 키가 비어있으면(아직 발급 전 등) 예외 대신 안내 문구를 반환해서, 그 상태로도 화면은 정상 동작하게 한다.
 */
@Slf4j
@Component
public class GeminiChatClient {

    private static final String API_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

    private static final String SYSTEM_PROMPT = """
            너는 여행 플래닝 서비스 'Dream Collection'의 AI 여행 상담 챗봇이야.
            여행지 추천, 일정 짜는 법, 준비물, 현지 정보 등 여행 관련 질문에 친절하고
            간결한 한국어로 답해줘. 여행과 무관한 질문에도 자연스럽게 답해도 되지만,
            너무 길게 늘어놓지 말고 핵심 위주로 3~5문장 이내로 답해.
            """;

    private final RestClient restClient = RestClient.builder()
            .requestFactory(timeoutRequestFactory())
            .build();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static SimpleClientHttpRequestFactory timeoutRequestFactory() {
        // 타임아웃을 안 걸어두면 네트워크가 막혀있을 때 응답이 무한 대기 상태로 걸려서
        // 프론트에서는 "챗봇이 답장이 없다"처럼 보임 → 접속/응답 제한시간을 명시적으로 설정.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000); // 10초
        factory.setReadTimeout(20_000);    // 20초
        return factory;
    }

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    public String chat(List<ChatMessageDto> history) {
        if (apiKey == null || apiKey.isBlank()) {
            return "챗봇 기능을 사용하려면 관리자가 Gemini API 키를 설정해야 해요. "
                    + "(백엔드 환경변수 GEMINI_API_KEY)";
        }

        // Gemini는 "user"/"model" 두 role만 씀 → 프론트/DTO의 "assistant"를 "model"로 변환
        List<Map<String, Object>> contents = history.stream()
                .map(m -> Map.of(
                        "role", m.role().equals("assistant") ? "model" : "user",
                        "parts", List.of(Map.of("text", m.content()))
                ))
                .toList();

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", SYSTEM_PROMPT))),
                "contents", contents
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
                return text.asText();
            }

            log.warn("Gemini API 응답에서 답변 텍스트를 찾지 못함: {}", response);
            return "죄송해요, 답변을 만들지 못했어요. 다시 시도해주세요.";
        } catch (Exception e) {
            log.error("Gemini API 호출 실패", e);
            return "일시적으로 챗봇에 연결할 수 없어요. 잠시 후 다시 시도해주세요.";
        }
    }
}
