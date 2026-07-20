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


@Slf4j
@Component

public class GeminiChatClient {
    private static final String API_URL_TEMPLATE =
            "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent";

    private static final String SYSTEM_PROMPT_BASE = """
            너는 여행 플래닝 서비스 'Dream Collection'의 AI 여행 상담 챗봇이야.
            여행지 추천, 일정 짜는 법, 준비물, 현지 정보 등 여행 관련 질문에 친절하고
            구체적으로 한국어로 답해줘. 성의 없이 뭉뚱그리지 말고, 실제로 도움이 되도록
            핵심 정보(예: 준비물 목록, 추천 이유, 구체적인 지명 등)를 담아서 답해.
            보통 3~6문장 정도가 적당하지만, 목록이 필요한 질문(준비물, 일정 등)이면
            항목별로 나눠 조금 더 길게 답해도 괜찮아. 단, 절대 문장을 중간에 끊지 말고
            항상 완결된 문장으로 마무리해.
            마크다운 문법(**굵게**, - 목록, # 제목 등)은 쓰지 마. 화면에 별표나 기호가
            그대로 노출되니, 목록이 필요하면 "1) ", "2) " 처럼 숫자와 괄호로, 강조하고
            싶으면 그냥 자연스러운 문장으로 표현해.
            아래는 이 사이트의 실제 최신 정보야 — 사용자가 "이 사이트", "여기", "인기 여행지",
            "회원 수", "몇 개국" 처럼 사이트 자체에 대해 물어보면 반드시 이 정보를 근거로 답해.
            네가 모르는 사이트 기능을 지어내지 말고, 아래에 없는 내용은 "정확한 정보는 고객센터나
            공지사항을 확인해주세요" 정도로 답해.
            """;

    // 답변이 중간에 끊기는 문제가 있어서(400은 한국어 기준 너무 짧음) 넉넉하게 올림.
    // 그래도 시스템 프롬프트에서 "3~6문장"으로 길이 자체를 유도하기 때문에 응답 속도는 크게 안 늦어짐.
    private static final int MAX_OUTPUT_TOKENS = 1024;

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

    @Value("${gemini.model:gemini-3.5-flash}")
    private String model;

    /**
     * @param history     지금까지의 대화 (user/assistant 턴)
     * @param siteContext SiteContextService가 조립한 "사이트 실제 현황" 문자열.
     *                    시스템 프롬프트 뒤에 덧붙여서, 모델이 이 사이트에 대한 질문에
     *                    실제 DB 값 기준으로 답할 수 있게 한다. (없으면 기본 프롬프트만 사용)
     */
    public String chat(List<ChatMessageDto> history, String siteContext) {
        if (apiKey == null || apiKey.isBlank()) {
            return "챗봇 기능을 사용하려면 관리자가 Gemini API 키를 설정해야 해요. "
                    + "(백엔드 환경변수 GEMINI_API_KEY)";
        }

        String systemPrompt = (siteContext == null || siteContext.isBlank())
                ? SYSTEM_PROMPT_BASE
                : SYSTEM_PROMPT_BASE + "\n\n" + siteContext;

        // Gemini는 "user"/"model" 두 role만 씀 → 프론트/DTO의 "assistant"를 "model"로 변환
        List<Map<String, Object>> contents = history.stream()
                .map(m -> Map.of(
                        "role", m.role().equals("assistant") ? "model" : "user",
                        "parts", List.of(Map.of("text", m.content()))
                ))
                .toList();

        Map<String, Object> requestBody = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", contents,
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
