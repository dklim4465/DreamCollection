package com.backend.verification;

import com.backend.global.exception.InvalidVerificationCodeException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PhoneVerificationService {

    private static final int CODE_LENGTH = 6;
    private static final long EXPIRATION_MINUTES = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PhoneVerificationRepository phoneVerificationRepository;
    private final SmsSender smsSender;

    @Transactional
    public void sendCode(String phone) {
        String code = generateCode();

        PhoneVerification verification = PhoneVerification.builder()
                .phone(phone)
                .code(code)
                .expiresAt(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES))
                .build();

        phoneVerificationRepository.save(verification);
        smsSender.send(phone, "[Dream Collection] ?∏Ï¶ùÎ≤àÌò∏??" + code + " ?ÖÎãà?? " + EXPIRATION_MINUTES + "Î∂??¥ÎÇ¥???ÖÎ†•?¥Ï£º?∏Ïöî.");
    }

    @Transactional
    public void verifyCode(String phone, String code) {
        PhoneVerification verification = phoneVerificationRepository
                .findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(InvalidVerificationCodeException::new);

        if (verification.isExpired() || !verification.matches(code)) {
            throw new InvalidVerificationCodeException();
        }

        verification.markVerified();
    }

    private String generateCode() {
        int code = RANDOM.nextInt(1_000_000); // 0 ~ 999999
        return String.format("%06d", code);
    }
}
