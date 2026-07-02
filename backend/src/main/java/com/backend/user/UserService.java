package com.backend.user;

import com.backend.user.dto.AuthResponse;
import com.backend.user.dto.LoginRequest;
import com.backend.user.dto.SignupRequest;
import com.backend.user.dto.UserResponse;
import com.backend.verification.EmailVerification;
import com.backend.verification.EmailVerificationRepository;
import com.backend.verification.PhoneVerification;
import com.backend.verification.PhoneVerificationRepository;
import com.backend.global.exception.AccountNotActiveException;
import com.backend.global.exception.DuplicateEmailException;
import com.backend.global.exception.DuplicateNicknameException;
import com.backend.global.exception.InvalidCredentialsException;
import com.backend.global.exception.InvalidVerificationCodeException;
import com.backend.global.exception.PhoneNotVerifiedException;
import com.backend.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PhoneVerificationRepository phoneVerificationRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        validateDuplicateEmail(request.email());
        validateDuplicateNickname(request.nickname());

        // ?´ë©”???´ë???ì¤?? íƒ??ë°©ì‹ë§?ê²€ì¦?(?????”êµ¬?˜ì? ?ŠìŒ)
        boolean emailVerified = false;
        boolean phoneVerified = false;

        if (request.verificationMethod() == SignupRequest.VerificationMethod.EMAIL) {
            validateEmailVerified(request.email(), request.emailVerificationCode());
            emailVerified = true;
        } else {
            validatePhoneVerified(request.phone(), request.phoneVerificationCode());
            phoneVerified = true;
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .nickname(request.nickname())
                .phone(request.phone())
                .phoneVerified(phoneVerified)
                .travelStyle(request.travelStyle())
                .build();

        if (emailVerified) {
            user.markEmailVerified();
        }

        User saved = userRepository.save(user);

        // ì¹´ë“œ ?•ë³´(cardNumber/cardExpiry/cardCvc)???˜ë„?ìœ¼ë¡??€?¥í•˜ì§€ ?ŠìŒ
        // PCI-DSS ê·œì •???ë³¸ ì¹´ë“œ ?•ë³´??PG?¬ì—?œë§Œ ?¤ë¤„????

        String accessToken = jwtTokenProvider.generateToken(saved.getId(), saved.getEmail());

        return new AuthResponse(accessToken, UserResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        // ?Œì…œ ?„ìš© ê°€?…ì??passwordHashê°€ ?†ìŒ ???´ë©”??ë¡œê·¸???ì²´ë¥??ˆìš©?˜ì? ?ŠìŒ
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        validateActiveAccount(user);

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail());
        return new AuthResponse(accessToken, UserResponse.from(user));
    }

    private void validateActiveAccount(User user) {
        switch (user.getStatus()) {
            case SUSPENDED -> throw new AccountNotActiveException("?´ìš©???•ì???ê³„ì •?…ë‹ˆ?? ê³ ê°?¼í„°??ë¬¸ì˜?´ì£¼?¸ìš”.");
            case WITHDRAWN -> throw new AccountNotActiveException("?ˆí‡´ ì²˜ë¦¬??ê³„ì •?…ë‹ˆ??");
            default -> { /* ACTIVE, ?•ìƒ ì§„í–‰ */ }
        }
    }

    private void validateDuplicateEmail(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new DuplicateEmailException();
        }
    }

    private void validateDuplicateNickname(String nickname) {
        if (userRepository.existsByNickname(nickname)) {
            throw new DuplicateNicknameException();
        }
    }

    private void validatePhoneVerified(String phone, String verificationCode) {
        if (phone == null || phone.isBlank()) {
            throw new PhoneNotVerifiedException();
        }

        // verifyCode() ?¨ê³„?ì„œ ?´ë? ?¸ì¦ ?„ë£Œ ì²˜ë¦¬(markVerified)ê°€ ?ë‚¬?”ì?ë§??•ì¸.
        // ?¸ì¦ ? íš¨?œê°„(5ë¶??€ "?¸ì¦ë²ˆí˜¸ ?…ë ¥" ?œì  ê¸°ì??´ë¼, ê·??´í›„ ?˜ë¨¸ì§€ ?¼ì„
        // ?‘ì„±?˜ëŠ” ?™ì•ˆ ?œê°„??ì§€?˜ë„ ?¬ë§Œë£?ì²˜ë¦¬?˜ì? ?Šë„ë¡?ë³„ë„ë¡?ë§Œë£Œë¥??¬ê??¬í•˜ì§€ ?ŠëŠ”??
        PhoneVerification verification = phoneVerificationRepository
                .findTopByPhoneOrderByCreatedAtDesc(phone)
                .orElseThrow(PhoneNotVerifiedException::new);

        boolean isValid = verification.matches(verificationCode) && verification.isVerified();

        if (!isValid) {
            throw new PhoneNotVerifiedException();
        }
    }

    private void validateEmailVerified(String email, String verificationCode) {
        EmailVerification verification = emailVerificationRepository
                .findTopByEmailOrderByCreatedAtDesc(email)
                .orElseThrow(InvalidVerificationCodeException::new);

        boolean isValid = verification.getCode().equals(verificationCode) && verification.isVerified();

        if (!isValid) {
            throw new InvalidVerificationCodeException();
        }
    }
}
