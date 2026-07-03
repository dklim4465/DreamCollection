package com.dreamcollection.domain.user.service;

import com.dreamcollection.domain.auth.service.KakaoOauthClient;
import com.dreamcollection.domain.user.dto.AuthResponse;
import com.dreamcollection.domain.user.dto.KakaoLoginRequest;
import com.dreamcollection.domain.user.dto.LoginRequest;
import com.dreamcollection.domain.user.dto.SignupRequest;
import com.dreamcollection.domain.user.dto.UserResponse;
import com.dreamcollection.domain.verification.entity.EmailVerification;
import com.dreamcollection.domain.verification.repository.EmailVerificationRepository;
import com.dreamcollection.domain.verification.entity.PhoneVerification;
import com.dreamcollection.domain.verification.repository.PhoneVerificationRepository;
import com.dreamcollection.global.exception.AccountNotActiveException;
import com.dreamcollection.global.exception.DuplicateEmailException;
import com.dreamcollection.global.exception.DuplicateNicknameException;
import com.dreamcollection.global.exception.InvalidCredentialsException;
import com.dreamcollection.global.exception.InvalidVerificationCodeException;
import com.dreamcollection.global.exception.PhoneNotVerifiedException;
import com.dreamcollection.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dreamcollection.domain.user.entity.User;
import com.dreamcollection.domain.user.entity.UserOauthAccount;
import com.dreamcollection.domain.user.repository.UserOauthAccountRepository;
import com.dreamcollection.domain.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PhoneVerificationRepository phoneVerificationRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final UserOauthAccountRepository userOauthAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final KakaoOauthClient kakaoOauthClient;

    @Transactional
    public AuthResponse signup(SignupRequest request, String userAgent, String ipAddress) {
        validateDuplicateEmail(request.email());
        validateDuplicateNickname(request.nickname());

        // 이메일/휴대폰 중 선택한 방식만 검증 (둘 다 요구하지 않음)
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

        // 카드 정보(cardNumber/cardExpiry/cardCvc)는 의도적으로 저장하지 않음
        // PCI-DSS 규정상 원본 카드 정보는 PG사에서만 다뤄야 함

        return issueTokens(saved, userAgent, ipAddress);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String userAgent, String ipAddress) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        // 소셜 전용 가입자는 passwordHash가 없음 → 이메일 로그인 자체를 허용하지 않음
        if (user.getPasswordHash() == null
                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        validateActiveAccount(user);

        return issueTokens(user, userAgent, ipAddress);
    }

    /**
     * 카카오 로그인.
     * 1) 인가 코드를 카카오 프로필로 교환
     * 2) 이미 연동된 계정이면 바로 로그인
     * 3) 연동 이력은 없지만 동일 이메일의 기존(이메일가입) 계정이 있으면 그 계정에 연동
     * 4) 둘 다 없으면 신규 회원(소셜 전용, 비밀번호 없음) 생성
     */
    @Transactional
    public AuthResponse kakaoLogin(KakaoLoginRequest request, String userAgent, String ipAddress) {
        KakaoOauthClient.KakaoUserInfo kakaoUser = kakaoOauthClient.getUserInfo(request.code());

        User user = userOauthAccountRepository
                .findByProviderAndProviderUserId(UserOauthAccount.OauthProvider.KAKAO, kakaoUser.providerUserId())
                .map(account -> userRepository.findById(account.getUserId())
                        .orElseThrow(InvalidCredentialsException::new))
                .orElseGet(() -> linkOrCreateKakaoUser(kakaoUser));

        validateActiveAccount(user);

        return issueTokens(user, userAgent, ipAddress);
    }

    private User linkOrCreateKakaoUser(KakaoOauthClient.KakaoUserInfo kakaoUser) {
        User user = userRepository.findByEmail(kakaoUser.email())
                .orElseGet(() -> createSocialUser(kakaoUser));

        userOauthAccountRepository.save(UserOauthAccount.builder()
                .userId(user.getId())
                .provider(UserOauthAccount.OauthProvider.KAKAO)
                .providerUserId(kakaoUser.providerUserId())
                .build());

        return user;
    }

    private User createSocialUser(KakaoOauthClient.KakaoUserInfo kakaoUser) {
        User newUser = User.builder()
                .email(kakaoUser.email())
                .passwordHash(null) // 소셜 전용 가입자 — 비밀번호 없음
                .name(kakaoUser.nickname())
                .nickname(generateUniqueNickname(kakaoUser.nickname()))
                .phoneVerified(false)
                .build();

        User saved = userRepository.save(newUser);
        if (kakaoUser.profileImageUrl() != null) {
            saved.updateProfileImage(kakaoUser.profileImageUrl());
        }
        return saved;
    }

    /** 닉네임은 유니크 제약이 있어서, 카카오 닉네임이 이미 쓰이는 중이면 뒤에 숫자를 붙여 충돌을 피한다. */
    private String generateUniqueNickname(String baseNickname) {
        String candidate = baseNickname;
        int suffix = 1;
        while (userRepository.existsByNickname(candidate)) {
            candidate = baseNickname + suffix++;
        }
        return candidate;
    }

    /**
     * Refresh Token으로 새 Access Token 재발급.
     * Refresh Token 자체도 함께 재발급(로테이션)해서 탈취 위험을 줄임 —
     * 기존 것은 폐기하고 새 것을 내려줌.
     */
    @Transactional
    public AuthResponse refresh(String rawRefreshToken, String userAgent, String ipAddress) {
        Long userId = refreshTokenService.validateAndGetUserId(rawRefreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(InvalidCredentialsException::new);

        refreshTokenService.revoke(rawRefreshToken); // 기존 토큰 폐기 (로테이션)
        return issueTokens(user, userAgent, ipAddress);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    private AuthResponse issueTokens(User user, String userAgent, String ipAddress) {
        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.issue(user.getId(), userAgent, ipAddress);
        return new AuthResponse(accessToken, refreshToken, UserResponse.from(user));
    }

    private void validateActiveAccount(User user) {
        switch (user.getStatus()) {
            case SUSPENDED -> throw new AccountNotActiveException("이용이 정지된 계정입니다. 고객센터에 문의해주세요.");
            case WITHDRAWN -> throw new AccountNotActiveException("탈퇴 처리된 계정입니다.");
            default -> { /* ACTIVE, 정상 진행 */ }
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

        // verifyCode() 단계에서 이미 인증 완료 처리(markVerified)가 끝났는지만 확인.
        // 인증 유효시간(5분)은 "인증번호 입력" 시점 기준이라, 그 이후 나머지 폼을
        // 작성하는 동안 시간이 지나도 재만료 처리되지 않도록 별도로 만료를 재검사하지 않는다.
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
