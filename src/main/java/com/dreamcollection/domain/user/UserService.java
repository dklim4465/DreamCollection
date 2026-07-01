package com.dreamcollection.domain.user;

import com.dreamcollection.domain.user.dto.AuthResponse;
import com.dreamcollection.domain.user.dto.LoginRequest;
import com.dreamcollection.domain.user.dto.SignupRequest;
import com.dreamcollection.domain.user.dto.UserResponse;
import com.dreamcollection.domain.verification.PhoneVerification;
import com.dreamcollection.domain.verification.PhoneVerificationRepository;
import com.dreamcollection.global.exception.AccountNotActiveException;
import com.dreamcollection.global.exception.DuplicateEmailException;
import com.dreamcollection.global.exception.DuplicateNicknameException;
import com.dreamcollection.global.exception.InvalidCredentialsException;
import com.dreamcollection.global.exception.PhoneNotVerifiedException;
import com.dreamcollection.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PhoneVerificationRepository phoneVerificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        validateDuplicateEmail(request.email());
        validateDuplicateNickname(request.nickname());
        validatePhoneVerified(request.phone(), request.phoneVerificationCode());

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .name(request.name())
                .nickname(request.nickname())
                .phone(request.phone())
                .phoneVerified(true)
                .travelStyle(request.travelStyle())
                .build();

        User saved = userRepository.save(user);

        // 카드 정보(cardNumber/cardExpiry/cardCvc)는 의도적으로 저장하지 않음
        // PCI-DSS 규정상 원본 카드 정보는 PG사에서만 다뤄야 함

        String accessToken = jwtTokenProvider.generateToken(saved.getId(), saved.getEmail());

        return new AuthResponse(accessToken, UserResponse.from(saved));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(InvalidCredentialsException::new);

        // 소셜 전용 가입자는 passwordHash가 없음 → 이메일 로그인 자체를 허용하지 않음
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
}
