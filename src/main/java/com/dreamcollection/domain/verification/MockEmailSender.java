package com.dreamcollection.domain.verification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 로컬 개발용 Mock 구현체. 실제 메일 대신 콘솔에 출력합니다.
 * application.yml에서 mail.provider=mock (기본값)일 때 사용됩니다.
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "mail.provider", havingValue = "mock", matchIfMissing = true)
public class MockEmailSender implements EmailSender {

    @Override
    public void send(String to, String subject, String content) {
        log.info("[MOCK EMAIL] to={} subject={} content={}", to, subject, content);
    }
}
