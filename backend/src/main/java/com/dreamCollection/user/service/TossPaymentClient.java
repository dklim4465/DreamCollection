package com.dreamCollection.user.service;

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

    private static final String BILLING_PAY_BASE_URL = "https://api.tosspayments.com/v1/billing/";
    private static final String ISSUE_BILLING_KEY_URL = "https://api.tosspayments.com/v1/billing/authorizations/issue";

    private final RestClient restClient = RestClient.create();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${toss.secret-key}")
    private String secretKey;

    public record BillingKeyResult(String billingKey, String cardCompany, String cardLast4) {
    }
    public record BillingPayResult(
            String paymentKey,
            String orderId,
            int totalAmount,
            String status,
            boolean mocked
    ) {}

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
    /**
     * 빌링키로 자동결제 승인.
     * customerKey는 빌링키 발급 때와 동일해야 함 (지금은 "user-" + userId).
     */
    public BillingPayResult payWithBillingKey(
            String billingKey,
            String customerKey,
            int amount,
            String orderId,
            String orderName
    ) {
        String authHeader = basicAuthHeader();

        try {
            String response = restClient.post()
                    .uri(BILLING_PAY_BASE_URL + billingKey)
                    .header("Authorization", authHeader)
                    .header("Content-Type", "application/json")
                    .body(Map.of(
                            "customerKey", customerKey,
                            "amount", amount,
                            "orderId", orderId,
                            "orderName", orderName
                    ))
                    .retrieve()
                    .onStatus(status -> status.value() == 401 || status.value() == 403, (req, res) -> {
                        throw new UnauthorizedTossException("토스 API 권한 오류: " + res.getStatusCode());
                    })
                    .body(String.class);

            JsonNode node = objectMapper.readTree(response);

            // 토스 비즈니스 에러: HTTP 200이어도 code 필드가 올 수 있음
            if (node.has("code")) {
                throw new IllegalStateException(
                        "토스 결제 실패: " + node.path("code").asText() + " / " + node.path("message").asText());
            }

            return new BillingPayResult(
                    node.path("paymentKey").asText(),
                    node.path("orderId").asText(orderId),
                    node.path("totalAmount").asInt(amount),
                    node.path("status").asText("DONE"),
                    false
            );
        } catch (UnauthorizedTossException e) {
            log.warn("Toss 권한 실패 → mock 승인. orderId={}, reason={}", orderId, e.getMessage());
            return mockPayResult(orderId, amount);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            // 시크릿키 비어있음 / 연결 실패 등도 mock으로 볼지 여부는 팀 선택
            // 합의: "권한 실패 시"만 mock → 그 외는 예외
            if (isLikelyAuthProblem(e)) {
                log.warn("Toss 인증 관련 실패 → mock 승인. orderId={}", orderId, e);
                return mockPayResult(orderId, amount);
            }
            throw new IllegalStateException("토스 결제 호출 실패: " + e.getMessage(), e);
        }
    }

    private String basicAuthHeader() {
        return "Basic " + Base64.getEncoder()
                .encodeToString((secretKey + ":").getBytes(StandardCharsets.UTF_8));
    }

    private BillingPayResult mockPayResult(String orderId, int amount) {
        return new BillingPayResult(
                "mock_pk_" + orderId,
                orderId,
                amount,
                "DONE",
                true
        );
    }

    private boolean isLikelyAuthProblem(Exception e) {
        String msg = String.valueOf(e.getMessage()) + String.valueOf(e.getCause());
        return msg.contains("401")
                || msg.contains("403")
                || msg.contains("Unauthorized")
                || msg.contains("invalid api key")
                || msg.contains("인증");
    }

    /** 401/403 전용 — mock 분기용 */
    private static class UnauthorizedTossException extends RuntimeException {
        UnauthorizedTossException(String message) {
            super(message);
        }
    }
}