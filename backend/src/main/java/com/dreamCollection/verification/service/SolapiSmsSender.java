package com.dreamCollection.verification.service;

import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

/**
 * Solapi(https://solapi.com) SMS API 연동 구현체.
 * application.yml 에서 sms.provider=solapi 로 설정하면 활성화됩니다.
 *
 * 사용 전 준비물:
 * 1) https://solapi.com 가입 → 콘솔에서 발신번호 사전 등록(본인 인증 필요)
 * 2) 콘솔 > API Key 관리 에서 API Key / API Secret 발급
 * 3) application.yml 또는 환경변수에 아래 값 입력:
 *    sms:
 *      provider: solapi
 *      solapi:
 *        api-key: ${SOLAPI_API_KEY}
 *        api-secret: ${SOLAPI_API_SECRET}
 *        sender: ${SOLAPI_SENDER}   # 콘솔에 사전 등록한 발신번호 (예: 0212345678)
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "sms.provider", havingValue = "solapi")
public class SolapiSmsSender implements SmsSender {

    private static final String SOLAPI_API_URL = "https://api.solapi.com/messages/v4/send";

    private final RestClient restClient = RestClient.create();

    @Value("${sms.solapi.api-key}")
    private String rawApiKey;

    @Value("${sms.solapi.api-secret}")
    private String rawApiSecret;

    @Value("${sms.solapi.sender}")
    private String sender;

    private String apiKey() { return rawApiKey.trim(); }
    private String apiSecret() { return rawApiSecret.trim(); }

    @Override
    public void send(String phone, String message) {
        log.info("[SOLAPI DEBUG] apiKey='{}' (length={}), sender='{}'", apiKey(), apiKey().length(), sender);
        String receiver = phone.replaceAll("-", "");

        Map<String, Object> body = Map.of(
                "message", Map.of(
                        "to", receiver,
                        "from", sender,
                        "text", message
                )
        );

        String response = restClient.post()
                .uri(SOLAPI_API_URL)
                .header("Authorization", buildAuthorizationHeader())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(String.class);

        log.info("[SOLAPI SMS] to={} response={}", phone, response);
        // TODO: 응답 JSON의 statusCode 파싱해서 실패("4000" 등) 시 예외 던지도록 보완
    }

    /**
     * Solapi HMAC-SHA256 인증 헤더 생성
     * 형식: HMAC-SHA256 apiKey={key}, date={ISO8601}, salt={random}, signature={hex}
     * signature = HMAC-SHA256(apiSecret, date + salt)
     */
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'").withZone(ZoneOffset.UTC);

    private String buildAuthorizationHeader() {
        String date = DATE_FORMATTER.format(Instant.now());
        String salt = UUID.randomUUID().toString().replace("-", "");
        String signature = generateSignature(date, salt);
        return "HMAC-SHA256 apiKey=" + apiKey() + ", date=" + date + ", salt=" + salt + ", signature=" + signature;
    }

    private String generateSignature(String date, String salt) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(apiSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal((date + salt).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new IllegalStateException("Solapi 서명 생성 실패", e);
        }
    }
}
