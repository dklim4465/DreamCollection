package com.dreamCollection.user.service;

import com.dreamCollection.global.exception.InvalidCredentialsException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

import com.dreamCollection.user.entity.RefreshToken;
import com.dreamCollection.user.repository.RefreshTokenRepository;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final long EXPIRATION_DAYS = 14; // Refresh Token 유효기간: 2주
    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    /** 로그인/회원가입 성공 시 새 Refresh Token 발급 + DB 저장 */
    @Transactional
    public String issue(Long userId, String userAgent, String ipAddress) {
        String rawToken = generateOpaqueToken();

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(rawToken)
                .userAgent(userAgent)
                .ipAddress(ipAddress)
                .expiresAt(LocalDateTime.now().plusDays(EXPIRATION_DAYS))
                .build();

        refreshTokenRepository.save(refreshToken);
        return rawToken;
    }

    /**
     * Refresh Token 검증 후 소유자 userId 반환.
     * 만료/폐기(로그아웃)된 토큰이면 예외.
     */
    @Transactional(readOnly = true)
    public Long validateAndGetUserId(String rawToken) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(rawToken)
                .orElseThrow(InvalidCredentialsException::new);

        if (!refreshToken.isValid()) {
            throw new InvalidCredentialsException();
        }
        return refreshToken.getUserId();
    }

    /** 로그아웃: 해당 Refresh Token을 폐기(revoke) 처리 */
    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByToken(rawToken)
                .ifPresent(RefreshToken::revoke);
    }

    /**
     * 비밀번호 재설정 완료 시 / 마이페이지 "모든 기기에서 로그아웃" 시 사용.
     * 해당 유저의 활성 세션을 전부 폐기해서, 이전에 발급된 refreshToken으로는
     * 더 이상 accessToken을 재발급받을 수 없게 한다.
     */
    @Transactional
    public void revokeAll(Long userId) {
        refreshTokenRepository.findAllByUserIdAndRevokedAtIsNullOrderByCreatedAtDesc(userId)
                .forEach(RefreshToken::revoke);
    }

    private String generateOpaqueToken() {
        byte[] bytes = new byte[48];
        RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
