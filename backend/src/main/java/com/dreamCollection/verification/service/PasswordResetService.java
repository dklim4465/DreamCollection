package com.dreamCollection.verification.service;

import com.dreamCollection.global.exception.InvalidPasswordResetTokenException;
import com.dreamCollection.global.exception.InvalidVerificationCodeException;
import com.dreamCollection.global.exception.UserNotFoundException;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import com.dreamCollection.user.service.RefreshTokenService;
import com.dreamCollection.verification.entity.EmailVerification;
import com.dreamCollection.verification.entity.PasswordResetToken;
import com.dreamCollection.verification.repository.EmailVerificationRepository;
import com.dreamCollection.verification.repository.PasswordResetTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * 비밀번호 찾기(재설정) 플로우.
 * 1) requestReset(email)            : 가입된 이메일인지 확인 후 인증코드 발송 (email_verifications, purpose=FIND_PASSWORD)
 * 2) verifyAndIssueResetToken(...)  : 인증코드 검증 성공 시, password_reset_tokens에 1회용 토큰 발급
 * 3) resetPassword(...)             : resetToken 검증 후 비밀번호 변경 + 기존 로그인 세션 전체 폐기
 */
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final long RESET_TOKEN_EXPIRATION_MINUTES = 30;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationService emailVerificationService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;

    @Transactional
    public void requestReset(String email) {
        // 회원가입 인증과 달리, 가입되어 있지 않은 이메일이면 애초에 코드를 보낼 이유가 없음
        if (!userRepository.existsByEmail(email)) {
            throw new UserNotFoundException();
        }
        emailVerificationService.sendCode(email, EmailVerification.Purpose.FIND_PASSWORD);
    }

    @Transactional
    public String verifyAndIssueResetToken(String email, String code) {
        EmailVerification verification = emailVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(InvalidVerificationCodeException::new);

        boolean isValid = verification.getPurpose() == EmailVerification.Purpose.FIND_PASSWORD
                && !verification.isExpired()
                && verification.getCode().equals(code);

        if (!isValid) {
            throw new InvalidVerificationCodeException();
        }
        verification.markVerified();

        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        String rawToken = generateOpaqueToken();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .userId(user.getId())
                .token(rawToken)
                .expiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRATION_MINUTES))
                .build();
        passwordResetTokenRepository.save(resetToken);

        return rawToken;
    }

    @Transactional
    public void resetPassword(String rawResetToken, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(rawResetToken)
                .orElseThrow(InvalidPasswordResetTokenException::new);

        if (!resetToken.isValid()) {
            throw new InvalidPasswordResetTokenException();
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(UserNotFoundException::new);

        user.changePassword(passwordEncoder.encode(newPassword));
        resetToken.markUsed();

        // 비밀번호가 바뀌었으니, 기존에 로그인되어 있던 모든 기기의 세션을 강제로 끊는다.
        refreshTokenService.revokeAll(user.getId());
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
