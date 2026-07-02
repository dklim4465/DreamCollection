package com.backend.verification;

import com.backend.global.exception.InvalidVerificationCodeException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailVerificationService {

    private static final long EXPIRATION_MINUTES = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailSender emailSender;

    @Transactional
    public void sendCode(String email, EmailVerification.Purpose purpose) {
        String code = generateCode();

        EmailVerification verification = EmailVerification.builder()
                .email(email)
                .code(code)
                .purpose(purpose != null ? purpose : EmailVerification.Purpose.SIGNUP)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES))
                .build();

        emailVerificationRepository.save(verification);

        String subject = "[Dream Collection] ?¥Î©î???∏Ï¶ùÎ≤àÌò∏";
        String content = "?∏Ï¶ùÎ≤àÌò∏??" + code + " ?ÖÎãà?? " + EXPIRATION_MINUTES + "Î∂??¥ÎÇ¥???ÖÎ†•?¥Ï£º?∏Ïöî.";
        emailSender.send(email, subject, content);
    }

    @Transactional
    public void verifyCode(String email, String code) {
        EmailVerification verification = emailVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(InvalidVerificationCodeException::new);

        if (verification.isExpired() || !verification.getCode().equals(code)) {
            throw new InvalidVerificationCodeException();
        }

        verification.markVerified();
    }

    private String generateCode() {
        int code = RANDOM.nextInt(1_000_000);
        return String.format("%06d", code);
    }
}
