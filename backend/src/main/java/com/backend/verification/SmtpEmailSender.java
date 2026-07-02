package com.backend.verification;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

/**
 * ?¤ì œ SMTP ë°œì†¡ êµ¬í˜„ì²?
 * application.yml?ì„œ mail.provider=smtp ë¡??¤ì •?˜ë©´ ?œì„±?”ë©?ˆë‹¤.
 *
 * ?¬ìš© ??ì¤€ë¹„ë¬¼:
 * 1) build.gradle ??spring-boot-starter-mail ?˜ì¡´??ì¶”ê?
 * 2) application.yml ??spring.mail.* SMTP ?‘ì†?•ë³´ ?…ë ¥ (?„ë˜ ì£¼ì„ ì°¸ê³ )
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
            log.error("?´ë©”??ë°œì†¡ ?¤íŒ¨: to={}", to, e);
            throw new IllegalStateException("?´ë©”??ë°œì†¡???¤íŒ¨?ˆìŠµ?ˆë‹¤.", e);
        }
    }
}
