package com.backend.verification;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 로컬 개발??Mock 구현�? ?�제 메일 ?�??콘솔??출력?�니??
 * application.yml?�서 mail.provider=mock (기본�??????�용?�니??
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
