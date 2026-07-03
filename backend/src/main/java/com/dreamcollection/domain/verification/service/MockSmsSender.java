package com.dreamcollection.domain.verification.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 실제 SMS 연동 전까지 사용하는 Mock 구현체.
 * 개발 중에는 콘솔에 인증번호를 출력해서 확인할 수 있게 함.
 * application.yml에서 sms.provider=mock (기본값)일 때 사용됩니다.
 * 실제 연동 시 sms.provider=aligo 로 바꾸면 AligoSmsSender가 대신 활성화됩니다.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "sms.provider", havingValue = "mock", matchIfMissing = true)
public class MockSmsSender implements SmsSender {

    @Override
    public void send(String phone, String message) {
        log.info("[MOCK SMS] to={} message={}", phone, message);
    }
}
