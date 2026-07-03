package com.dreamcollection.domain.verification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * 실제 SMTP 발송 구현체.
 * application.yml에서 mail.provider=smtp 로 설정하면 활성화됩니다.
 *
 * 사용 전 준비물:
 * 1) build.gradle 에 spring-boot-starter-mail 의존성 추가
 * 2) application.yml 에 spring.mail.* SMTP 접속정보 입력 (아래 주석 참고)
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "mail.provider", havingValue = "smtp")
public class SmtpEmailSender implements EmailSender {

    private final JavaMailSender javaMailSender;

    @Override
    public void send(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        try {
            javaMailSender.send(message);
        } catch (Exception e) {
            log.error("이메일 발송 실패: to={}", to, e);
            throw new IllegalStateException("이메일 발송에 실패했습니다.", e);
        }
    }
}
