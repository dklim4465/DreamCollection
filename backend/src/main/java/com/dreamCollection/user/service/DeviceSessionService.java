package com.dreamCollection.user.service;

import com.dreamCollection.global.exception.DeviceNotFoundException;
import com.dreamCollection.user.dto.DeviceSessionResponse;
import com.dreamCollection.user.dto.LoginHistoryResponse;
import com.dreamCollection.user.entity.RefreshToken;
import com.dreamCollection.user.repository.LoginHistoryRepository;
import com.dreamCollection.user.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * 마이페이지 "로그인 활동" — 최근 로그인 기록 조회 + 로그인된 기기(세션) 목록/개별 로그아웃/전체 로그아웃.
 */
@Service
@RequiredArgsConstructor
public class DeviceSessionService {

    private final LoginHistoryRepository loginHistoryRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional(readOnly = true)
    public List<LoginHistoryResponse> getLoginHistory(Long userId) {
        return loginHistoryRepository.findTop20ByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(LoginHistoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DeviceSessionResponse> getMyDevices(Long userId) {
        return refreshTokenRepository.findAllByUserIdAndRevokedAtIsNullOrderByCreatedAtDesc(userId).stream()
                .map(DeviceSessionResponse::from)
                .toList();
    }

    /** 특정 기기 하나만 로그아웃. deviceId는 refresh_tokens.id — 본인 소유가 아니면 404 처리 */
    @Transactional
    public void revokeDevice(Long userId, Long deviceId) {
        RefreshToken refreshToken = refreshTokenRepository.findByIdAndUserId(deviceId, userId)
                .orElseThrow(DeviceNotFoundException::new);
        refreshToken.revoke();
    }

    /** 모든 기기에서 로그아웃 (지금 이 요청을 보낸 기기 포함) */
    @Transactional
    public void revokeAllDevices(Long userId) {
        refreshTokenRepository.findAllByUserIdAndRevokedAtIsNullOrderByCreatedAtDesc(userId)
                .forEach(RefreshToken::revoke);
    }
}
