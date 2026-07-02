package com.backend.verification;

/**
 * ?�메??발송 추상??
 * 로컬 개발 중에??MockEmailSender(콘솔 로그), ?�제 배포 ?�에??
 * SmtpEmailSender(?�제 SMTP 발송)�??�용?�니??
 * application.yml??mail.provider 값으�??�환?�니??(mock / smtp).
 */
public interface EmailSender {
    void send(String to, String subject, String content);
}
