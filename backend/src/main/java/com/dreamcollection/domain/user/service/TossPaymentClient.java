package com.dreamcollection.domain.user.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

/**
 * 토스페이먼츠 빌링키(카드 등록) 연동.
 *
 * 사용 전 준비물:
 * 1) https://developers.tosspayments.com 에서 상점 등록 (테스트는 가입만 해도 테스트 키 바로 발급됨)
 * 2) 연동 키 메뉴에서 시크릿 키(test_sk_... / live_sk_...) 발급 → application.yml의 TOSS_SECRET_KEY
 * 3) 클라이언트 키(test_ck_... / live_ck_...)는 프론트에서 SDK 초기화할 때 사용 → TOSS_CLIENT_KEY
 *
 * 흐름: 프론트가 토스 SDK의 requestBillingAuth()로 카드 등록 위젯 오픈
 *      → 사용자가 카드정보를 토스 서버에 직접 입력(우리 서버는 카드번호를 절대 안 봄)
 *      → 토스가 프론트 successUrl로 authKey, customerKey를 붙여서 리다이렉트
 *      → 프론트가 그 authKey를 이 백엔드로 전달
 *      → 백엔드가 이 클래스로 authKey를 실제 billingKey로 교환
 */
@Slf4j
@Component
public class TossPaymentClient {

    private static final String ISSUE_BILLING_KEY_URL = "https://api.tosspayments.com/v1/billing/authorizations/issue";

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${toss.secret-key}")
    private String secretKey;

    public record BillingKeyResult(String billingKey, String cardCompany, String cardLast4) {
    }

    public BillingKeyResult issueBillingKey(String authKey, String customerKey) {
        String authHeader = "Basic " + Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));

        String response = restClient.post()
                .uri(ISSUE_BILLING_KEY_URL)
                .header("Authorization", authHeader)
                .header("Content-Type", "application/json")
                .body(Map.of("authKey", authKey, "customerKey", customerKey))
                .retrieve()
                .body(String.class);

        try {
            JsonNode node = objectMapper.readTree(response);

            if (node.has("code")) {
                // 토스 API 에러 응답 형태: {"code": "...", "message": "..."}
                throw new IllegalStateException("토스페이먼츠 빌링키 발급 실패: " + node.path("message").asText());
            }

            String billingKey = node.get("billingKey").asText();
            JsonNode card = node.path("card");
            String cardCompany = card.path("issuerCode").asText(null);
            String cardNumber = card.path("number").asText(""); // 마스킹된 형태로 내려옴 (예: 1234****...)
            String cardLast4 = cardNumber.length() >= 4
                    ? cardNumber.substring(cardNumber.length() - 4)
                    : null;

            return new BillingKeyResult(billingKey, cardCompany, cardLast4);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("토스페이먼츠 응답 파싱 실패", e);
        }
    }
}