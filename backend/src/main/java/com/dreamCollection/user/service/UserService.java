package com.dreamCollection.user.service;

import com.dreamCollection.auth.service.KakaoOauthClient;
import com.dreamCollection.badge.service.BadgeService;
import com.dreamCollection.global.exception.BusinessException;
import com.dreamCollection.global.exception.NicknameChangeCooldownException;
import com.dreamCollection.user.dto.AuthResponse;
import com.dreamCollection.user.dto.KakaoLoginRequest;
import com.dreamCollection.user.dto.LoginRequest;
import com.dreamCollection.user.dto.SignupRequest;
import com.dreamCollection.user.dto.UserResponse;
import com.dreamCollection.user.entity.TravelStyle;
import com.dreamCollection.verification.entity.EmailVerification;
import com.dreamCollection.verification.repository.EmailVerificationRepository;
import com.dreamCollection.verification.entity.PhoneVerification;
import com.dreamCollection.verification.repository.PhoneVerificationRepository;
import com.dreamCollection.global.exception.AccountNotActiveException;
import com.dreamCollection.global.exception.DuplicateEmailException;
import com.dreamCollection.global.exception.DuplicateNicknameException;
import com.dreamCollection.global.exception.DuplicatePhoneException;
import com.dreamCollection.global.exception.InvalidCredentialsException;
import com.dreamCollection.global.exception.InvalidVerificationCodeException;
import com.dreamCollection.global.exception.PhoneNotVerifiedException;
import com.dreamCollection.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.entity.UserOauthAccount;
import com.dreamCollection.user.entity.LoginHistory;
import com.dreamCollection.user.repository.LoginHistoryRepository;
import com.dreamCollection.user.repository.UserOauthAccountRepository;
import com.dreamCollection.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private static final int NICKNAME_CHANGE_COOLDOWN_DAYS = 14;
    private static final String WELCOME_BADGE_CODE = "WELCOME";

    private final UserRepository userRepository;
    private final PhoneVerificationRepository phoneVerificationRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final UserOauthAccountRepository userOauthAccountRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;
    private final KakaoOauthClient kakaoOauthClient;
    private final BadgeService badgeService;

    /**
     * 프론트: authApi.getMe() → GET /api/auth/me
     * 새로고침 시 accessToken은 남아있지만 유저 정보(user)는 메모리에서 날아간 상태를
     * 복구하기 위해, 토큰의 userId로 최신 유저 정보를 다시 조회해서 내려준다.
     * userId가 없으면(비로그인) null 반환 — 프론트에서 비로그인으로 처리.
     */
    public UserResponse getMe(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId)
                .map(UserResponse::from)
                .orElse(null);
    }

    /**
     * 마이페이지 "프로필 수정"에서 사용. nickname이 바뀌는 경우에만 중복 체크 + 2주 쿨다운 체크.
     */
    @Transactional
    public UserResponse updateProfile(Long userId, String nickname, String profileImageUrl, TravelStyle travelStyle) {
        User user = userRepository.findById(userId).orElseThrow(InvalidCredentialsException::new);

        if (nickname != null && !nickname.isBlank() && !nickname.equals(user.getNickname())) {
            if (user.getNicknameChangedAt() != null
                    && user.getNicknameChangedAt().isAfter(LocalDateTime.now().minusDays(NICKNAME_CHANGE_COOLDOWN_DAYS))) {
                throw new NicknameChangeCooldownException(
                        user.getNicknameChangedAt().plusDays(NICKNAME_CHANGE_COOLDOWN_DAYS));
            }
            validateDuplicateNickname(nickname);
        }

        user.updateProfile(nickname, profileImageUrl, travelStyle);
        return UserResponse.from(user);
    }

    /**
     * 마이페이지 "비밀번호 변경" (로그인 상태, 현재 비밀번호 재확인 후 변경).
     * 성공 시 다른 기기의 로그인 세션은 전부 강제 로그아웃(보안).
     */
    @Transactional
    public void changeMyPassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElseThrow(InvalidCredentialsException::new);

        if (user.getPasswordHash() == null) {
            throw new BusinessException("소셜 로그인 계정은 비밀번호 변경이 불가능해요.", HttpStatus.FORBIDDEN);
        }
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        user.changePassword(passwordEncoder.encode(newPassword));
        refreshTokenService.revokeAll(userId);
    }

    /**
     * 회원가입창 "이메일 중복확인" 버튼 → GET /api/auth/check-email
     * true = 사용 가능(중복 아님), false = 이미 가입된 이메일
     */
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    /**
     * 회원가입창 "휴대폰 중복확인" 버튼 → GET /api/auth/check-phone
     * true = 사용 가능(중복 아님), false = 이미 가입된 휴대폰 번호
     */
    public boolean isPhoneAvailable(String phone) {
        return !userRepository.existsByPhone(phone);
    }

    @Transactional
    public AuthResponse signup(SignupRequest request, String userAgent, String ipAddress) {
        validateDuplicateEmail(request.email());
        validateDuplicateNickname(request.nickname());
        validateDuplicatePhone(request.phone());

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

        // 가입 축하 기본 뱃지 지급 (모든 신규 유저 공통). 뱃지 지급이 실패해도
        // 회원가입 자체는 막지 않기 위해 예외를 잡아서 로그만 남긴다.
        try {
            badgeService.grantBadge(saved.getId(), WELCOME_BADGE_CODE);
        } catch (Exception e) {
            log.warn("가입 축하 뱃지 지급 실패 (userId={})", saved.getId(), e);
        }

        // 7월 신규가입 이벤트 쿠폰(WELCOME10)은 더 이상 가입 시 자동 지급하지 않는다.
        // 대신 공지사항에 안내글을 올려두고, 사용자가 직접 열람 후 [쿠폰받기] 버튼을
        // 눌러야 지급되도록 바뀌었다 (CouponController#claimCoupon, coupon_code 참조).

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
            recordLoginHistory(user.getId(), LoginHistory.LoginType.EMAIL, userAgent, ipAddress, false);
            throw new InvalidCredentialsException();
        }

        validateActiveAccount(user);
        recordLoginHistory(user.getId(), LoginHistory.LoginType.EMAIL, userAgent, ipAddress, true);

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
        recordLoginHistory(user.getId(), LoginHistory.LoginType.KAKAO, userAgent, ipAddress, true);

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
        // 가입 축하 기본 뱃지 지급 (이메일 가입과 동일하게 신규 유저 전원 대상)
        try {
            badgeService.grantBadge(saved.getId(), WELCOME_BADGE_CODE);
        } catch (Exception e) {
            log.warn("가입 축하 뱃지 지급 실패 (userId={})", saved.getId(), e);
        }
        // 웰컴 쿠폰은 공지사항 [쿠폰받기] 버튼을 통해서만 지급 (자동 지급하지 않음)
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

    /** 로그인 성공/실패 시도를 login_history 테이블에 기록 (마이페이지 "최근 로그인 기록"에서 조회) */
    private void recordLoginHistory(Long userId, LoginHistory.LoginType type,
                                    String userAgent, String ipAddress, boolean success) {
        loginHistoryRepository.save(LoginHistory.builder()
                .userId(userId)
                .loginType(type)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .success(success)
                .build());
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

    // phone은 NULL 허용 컬럼(EMAIL 인증 방식일 땐 미입력 가능)이라 값이 있을 때만 중복 검사
    private void validateDuplicatePhone(String phone) {
        if (phone != null && !phone.isBlank() && userRepository.existsByPhone(phone)) {
            throw new DuplicatePhoneException();
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