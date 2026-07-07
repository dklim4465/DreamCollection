package com.dreamCollection.verification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

/**
 * 알리고(https://smartsms.aligo.in) SMS API 연동 구현체.
 * application.yml 에서 sms.provider=aligo 로 설정하면 활성화됩니다.
 *
 * 사용 전 준비물:
 * 1) 알리고(https://smartsms.aligo.in) 가입 → API 키 발급 → 발신번호 사전 등록
 * 2) application.yml 에 아래 값 입력:
 *    sms:
 *      provider: aligo
 *      aligo:
 *        api-key: {발급받은 API 키}
 *        user-id: {알리고 로그인 아이디}
 *        sender: {사전 등록한 발신번호, 예: 0212345678}
 *
 * 참고: 알리고는 국내 서비스라 가입 시 사업자 인증이 필요할 수 있습니다.
 *      팀/개인 프로젝트 단계에서는 우선 MockSmsSender로 개발하다가,
 *      실제 배포 직전에 이 구현체로 전환하는 걸 권장합니다.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "sms.provider", havingValue = "aligo")
public class AligoSmsSender implements SmsSender {

    private static final String ALIGO_API_URL = "https://apis.aligo.in/send/";

    private final RestClient restClient = RestClient.create();

    @Value("${sms.aligo.api-key}")
    private String apiKey;

    @Value("${sms.aligo.user-id}")
    private String userId;

    @Value("${sms.aligo.sender}")
    private String sender;

    @Override
    public void send(String phone, String message) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("key", apiKey);
        form.add("user_id", userId);
        form.add("sender", sender);
        form.add("receiver", phone.replaceAll("-", ""));
        form.add("msg", message);

        String response = restClient.post()
                .uri(ALIGO_API_URL)
                .body(form)
                .retrieve()
                .body(String.class);

        log.info("[ALIGO SMS] to={} response={}", phone, response);
        // TODO: 응답 JSON의 result_code 파싱해서 실패 시 예외 던지도록 보완
    }
}
