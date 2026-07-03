package com.dreamcollection.domain.verification.service;

/**
 * 이메일 발송 추상화.
 * 로컬 개발 중에는 MockEmailSender(콘솔 로그), 실제 배포 시에는
 * SmtpEmailSender(실제 SMTP 발송)를 사용합니다.
 * application.yml의 mail.provider 값으로 전환됩니다 (mock / smtp).
 */
public interface EmailSender {
    void send(String to, String subject, String content);
}
